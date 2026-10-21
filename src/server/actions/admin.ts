'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  users,
  leads,
  notificationOutbox,
  priceListVersions,
  priceListItems,
  auditLog,
} from '@/server/db/schema';
import {
  createSession,
  invalidateSession,
  requireAdmin,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '@/server/auth/session';
import { verifyPassword } from '@/server/auth/password';
import { sendTelegramMessage } from '@/server/telegram/bot';
import { formatTelegramLeadMessage } from '@/server/telegram/format';
import type { City, CalculationResult } from '@/domain/calculator/types';

// Admin Login Action
export async function loginAdminAction(formData: FormData) {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Пожалуйста, заполните email и пароль' };
  }

  const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);

  const user = foundUsers[0];
  if (!user) {
    return { error: 'Неверный email или пароль' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Неверный email или пароль' };
  }

  const { token, expiresAt } = await createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect('/_console');
}

// Admin Logout Action
export async function logoutAdminAction() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie && sessionCookie.value) {
    await invalidateSession(sessionCookie.value);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/_console/login');
}

// Update Lead Status
export async function updateLeadStatusAction(leadId: string, status: string) {
  const admin = await requireAdmin();

  const validStatuses = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    throw new Error('INVALID_STATUS');
  }

  await db
    .update(leads)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  await db.insert(auditLog).values({
    actorId: admin.id,
    entityType: 'LEAD',
    entityId: leadId,
    action: `STATUS_CHANGE_TO_${status}`,
  });

  return { success: true };
}

// Retry Telegram Notification for Lead
export async function retryLeadNotificationAction(leadId: string) {
  const admin = await requireAdmin();

  const outboxItems = await db
    .select()
    .from(notificationOutbox)
    .where(eq(notificationOutbox.leadId, leadId))
    .limit(1);

  const outbox = outboxItems[0];
  if (!outbox) {
    throw new Error('OUTBOX_ITEM_NOT_FOUND');
  }

  const leadRecords = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);

  const lead = leadRecords[0];
  if (!lead) {
    throw new Error('LEAD_NOT_FOUND');
  }

  const adminBaseUrl = process.env.ADMIN_BASE_URL || 'http://admin.localhost:3000';
  const msg = formatTelegramLeadMessage({
    publicNumber: lead.publicNumber,
    city: lead.city as City,
    type: lead.type,
    name: lead.name,
    phoneE164: lead.phoneE164,
    comment: lead.comment,
    quote: null,
    adminBaseUrl,
    leadId: lead.id,
  });

  const res = await sendTelegramMessage(msg);

  if (res.success) {
    await db
      .update(notificationOutbox)
      .set({
        status: 'SENT',
        telegramMessageId: res.messageId || null,
        sentAt: new Date(),
      })
      .where(eq(notificationOutbox.id, outbox.id));
  } else {
    await db
      .update(notificationOutbox)
      .set({
        status: 'FAILED_RETRYABLE',
        lastErrorCode: res.error || 'MANUAL_RETRY_FAILED',
        attempts: outbox.attempts + 1,
      })
      .where(eq(notificationOutbox.id, outbox.id));
  }

  await db.insert(auditLog).values({
    actorId: admin.id,
    entityType: 'NOTIFICATION',
    entityId: outbox.id,
    action: res.success ? 'RETRY_SUCCESS' : 'RETRY_FAILED',
  });

  return { success: res.success, error: res.error };
}

// Publish New Price List Version Atomically
export async function publishPriceVersionAction(
  city: City,
  items: Array<{ serviceCode: string; minPriceKopeks: number; maxPriceKopeks: number | null }>,
) {
  const admin = await requireAdmin();

  // Validate all items: min >= 0 and (max === null || max >= min)
  for (const item of items) {
    if (item.minPriceKopeks < 0) {
      throw new Error(`Отрицательная цена для ${item.serviceCode}`);
    }
    if (item.maxPriceKopeks !== null && item.maxPriceKopeks < item.minPriceKopeks) {
      throw new Error(`Максимальная цена меньше минимальной для ${item.serviceCode}`);
    }
  }

  return await db.transaction(async (tx) => {
    // 1. Get latest version number for city
    const latestVersions = await tx
      .select()
      .from(priceListVersions)
      .where(eq(priceListVersions.city, city))
      .orderBy(desc(priceListVersions.versionNumber))
      .limit(1);

    const nextVersionNumber = (latestVersions[0]?.versionNumber ?? 0) + 1;

    // 2. Archive previous published version
    await tx
      .update(priceListVersions)
      .set({ status: 'ARCHIVED' })
      .where(eq(priceListVersions.city, city));

    // 3. Insert new published version
    const newVersion = await tx
      .insert(priceListVersions)
      .values({
        city,
        versionNumber: nextVersionNumber,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedBy: admin.id,
        algorithmVersion: '1.0.0',
      })
      .returning();

    const versionRecord = newVersion[0]!;

    // 4. Insert items
    for (const it of items) {
      await tx.insert(priceListItems).values({
        versionId: versionRecord.id,
        serviceCode: it.serviceCode,
        minPriceKopeks: it.minPriceKopeks,
        maxPriceKopeks: it.maxPriceKopeks,
        isEnabled: true,
      });
    }

    // 5. Audit log
    await tx.insert(auditLog).values({
      actorId: admin.id,
      entityType: 'PRICE_LIST',
      entityId: versionRecord.id,
      action: `PUBLISH_VERSION_${city.toUpperCase()}_v${nextVersionNumber}`,
    });

    return {
      success: true,
      versionId: versionRecord.id,
      versionNumber: nextVersionNumber,
    };
  });
}
