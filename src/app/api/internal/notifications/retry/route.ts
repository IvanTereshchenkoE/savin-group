import { NextResponse } from 'next/server';
import { and, or, eq, lte, lt, isNull } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { notificationOutbox, leads, leadCalculationSnapshots } from '@/server/db/schema';
import { sendTelegramMessage } from '@/server/telegram/bot';
import { formatTelegramLeadMessage } from '@/server/telegram/format';
import type { CalculationResult } from '@/domain/calculator/types';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const secret = process.env.NOTIFICATION_CRON_SECRET || 'internal-secret';

  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const now = new Date();
  const lockExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min lock

  // Find eligible notifications
  const pendingItems = await db
    .select({
      outbox: notificationOutbox,
      lead: leads,
      snapshot: leadCalculationSnapshots,
    })
    .from(notificationOutbox)
    .innerJoin(leads, eq(notificationOutbox.leadId, leads.id))
    .leftJoin(leadCalculationSnapshots, eq(leads.id, leadCalculationSnapshots.leadId))
    .where(
      and(
        or(
          eq(notificationOutbox.status, 'PENDING'),
          eq(notificationOutbox.status, 'FAILED_RETRYABLE'),
        ),
        lte(notificationOutbox.nextAttemptAt, now),
        or(isNull(notificationOutbox.lockedUntil), lt(notificationOutbox.lockedUntil, now)),
      ),
    )
    .limit(10);

  if (pendingItems.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No pending items' });
  }

  const adminBaseUrl = process.env.ADMIN_BASE_URL || 'http://admin.localhost:3000';
  let successCount = 0;
  let failureCount = 0;

  for (const item of pendingItems) {
    // Claim lock atomically
    await db
      .update(notificationOutbox)
      .set({ lockedUntil: lockExpires })
      .where(eq(notificationOutbox.id, item.outbox.id));

    const quoteResult = item.snapshot?.result as CalculationResult | null;

    const message = formatTelegramLeadMessage({
      publicNumber: item.lead.publicNumber,
      city: item.lead.city as 'spb' | 'nn',
      type: item.lead.type,
      name: item.lead.name,
      phoneE164: item.lead.phoneE164,
      comment: item.lead.comment,
      quote: quoteResult,
      adminBaseUrl,
      leadId: item.lead.id,
    });

    const result = await sendTelegramMessage(message);

    if (result.success) {
      successCount++;
      await db
        .update(notificationOutbox)
        .set({
          status: 'SENT',
          telegramMessageId: result.messageId || null,
          sentAt: new Date(),
          lockedUntil: null,
        })
        .where(eq(notificationOutbox.id, item.outbox.id));
    } else {
      failureCount++;
      const nextAttempts = item.outbox.attempts + 1;
      const isExhausted = nextAttempts >= 5;

      // Exponential backoff: 1m, 5m, 15m, 60m
      const delaysMinutes = [1, 5, 15, 60];
      const delayMin = delaysMinutes[Math.min(nextAttempts - 1, delaysMinutes.length - 1)] ?? 60;
      const nextAttemptAt = new Date(Date.now() + delayMin * 60 * 1000);

      await db
        .update(notificationOutbox)
        .set({
          status: isExhausted ? 'NEEDS_ATTENTION' : 'FAILED_RETRYABLE',
          attempts: nextAttempts,
          nextAttemptAt,
          lastErrorCode: result.error || 'SEND_ERROR',
          lockedUntil: null,
        })
        .where(eq(notificationOutbox.id, item.outbox.id));
    }
  }

  return NextResponse.json({
    processed: pendingItems.length,
    successCount,
    failureCount,
  });
}
