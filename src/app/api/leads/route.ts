import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { leads, leadCalculationSnapshots, notificationOutbox } from '@/server/db/schema';
import { calculatorInputSchema } from '@/domain/calculator/schemas';
import { calculateEstimate } from '@/domain/calculator/calculate';
import { getPublishedPriceList } from '@/server/repositories/pricing';
import { sendTelegramMessage } from '@/server/telegram/bot';
import { formatTelegramLeadMessage } from '@/server/telegram/format';
import type { CalculationResult } from '@/domain/calculator/types';

// Phone normalization helper for Russian & International numbers
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

const leadSubmissionSchema = z.object({
  idempotencyKey: z.string().uuid('Некорректный ключ идемпотентности'),
  city: z.enum(['spb', 'nn']),
  type: z.enum(['CALCULATOR', 'CALLBACK', 'CASE', 'CONTACT']).default('CALCULATOR'),
  name: z.string().max(100).optional(),
  phone: z.string().min(5, 'Укажите номер телефона').max(30),
  comment: z.string().max(1000).optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Необходимо подтвердить согласие на обработку персональных данных',
  }),
  priceListVersionId: z.string().optional(),
  calculatorInput: calculatorInputSchema.optional(),
  sourcePath: z.string().max(200).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  honeypot: z.string().optional(), // Must be empty
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parseResult = leadSubmissionSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: 'Ошибка валидации формы заявки',
          fieldErrors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parseResult.data;

    // Honeypot spam trap
    if (data.honeypot && data.honeypot.trim().length > 0) {
      return NextResponse.json({
        success: true,
        publicNumber: 'SG-2026-SPAM-IGNORED',
      });
    }

    // Phone validation & normalization
    const normalizedPhone = normalizePhone(data.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          code: 'INVALID_PHONE',
          message: 'Пожалуйста, введите корректный номер телефона (например, +7 999 123-45-67)',
        },
        { status: 400 },
      );
    }

    // Idempotency check: return existing lead if already created
    const existingLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.idempotencyKey, data.idempotencyKey))
      .limit(1);

    const existingLead = existingLeads[0];
    if (existingLead) {
      return NextResponse.json({
        success: true,
        publicNumber: existingLead.publicNumber,
        duplicate: true,
      });
    }

    let calculatedQuote: CalculationResult | null = null;
    const currentPriceList = await getPublishedPriceList(data.city);

    // Stale price check for calculator leads
    if (data.type === 'CALCULATOR' && data.calculatorInput) {
      if (data.priceListVersionId && data.priceListVersionId !== currentPriceList.versionId) {
        // Price changed between client quote and form submit!
        const updatedQuote = calculateEstimate(data.calculatorInput, currentPriceList);
        return NextResponse.json(
          {
            code: 'PRICE_UPDATED',
            message:
              'Прайс-лист был обновлен. Пожалуйста, проверьте актуальную смету перед отправкой.',
            updatedQuote,
          },
          { status: 409 },
        );
      }

      // Authoritative server calculation
      calculatedQuote = calculateEstimate(data.calculatorInput, currentPriceList);
    }

    // Generate unique short public number (e.g. SG-2026-XXXXXX)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const publicNumber = `SG-2026-${randomSuffix}`;

    const adminBaseUrl = process.env.ADMIN_BASE_URL || 'http://admin.localhost:3000';

    // Transactional DB persistence
    const newLeadResult = await db.transaction(async (tx) => {
      const insertedLeads = await tx
        .insert(leads)
        .values({
          publicNumber,
          idempotencyKey: data.idempotencyKey,
          type: data.type,
          city: data.city,
          name: data.name?.trim() || null,
          phoneE164: normalizedPhone,
          comment: data.comment?.trim() || null,
          sourcePath: data.sourcePath || null,
          utm: data.utm || null,
          status: 'NEW',
          consentDocumentVersion: 'v1.0',
        })
        .returning();

      const createdLead = insertedLeads[0]!;

      // Snapshot calculation if present
      if (calculatedQuote && data.calculatorInput) {
        await tx.insert(leadCalculationSnapshots).values({
          leadId: createdLead.id,
          priceListVersionId: currentPriceList.versionId,
          algorithmVersion: calculatedQuote.algorithmVersion,
          input: data.calculatorInput,
          result: calculatedQuote,
          totalMinKopeks: calculatedQuote.total.minKopeks,
          totalMaxKopeks: calculatedQuote.total.maxKopeks,
        });
      }

      // Add to notification outbox
      const insertedOutbox = await tx
        .insert(notificationOutbox)
        .values({
          leadId: createdLead.id,
          channel: 'TELEGRAM',
          status: 'PENDING',
        })
        .returning();

      return {
        lead: createdLead,
        outbox: insertedOutbox[0]!,
      };
    });

    // Attempt immediate Telegram notification (non-blocking for HTTP response)
    const tgMessage = formatTelegramLeadMessage({
      publicNumber,
      city: data.city,
      type: data.type,
      name: data.name,
      phoneE164: normalizedPhone,
      comment: data.comment,
      quote: calculatedQuote,
      adminBaseUrl,
      leadId: newLeadResult.lead.id,
    });

    sendTelegramMessage(tgMessage)
      .then(async (tgResult) => {
        if (tgResult.success) {
          await db
            .update(notificationOutbox)
            .set({
              status: 'SENT',
              telegramMessageId: tgResult.messageId || null,
              sentAt: new Date(),
            })
            .where(eq(notificationOutbox.id, newLeadResult.outbox.id));
        } else {
          await db
            .update(notificationOutbox)
            .set({
              status: 'FAILED_RETRYABLE',
              lastErrorCode: tgResult.error || 'UNKNOWN_ERROR',
              attempts: 1,
              nextAttemptAt: new Date(Date.now() + 60 * 1000), // Retry in 1 min
            })
            .where(eq(notificationOutbox.id, newLeadResult.outbox.id));
        }
      })
      .catch((err) => {
        console.error('[Notification Dispatch Error]:', err);
      });

    return NextResponse.json(
      {
        success: true,
        publicNumber,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error('[API Leads Error]:', err);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Не удалось сохранить заявку. Пожалуйста, попробуйте еще раз позже.',
      },
      { status: 500 },
    );
  }
}
