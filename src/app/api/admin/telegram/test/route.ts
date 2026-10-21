import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/session';
import { sendTelegramMessage } from '@/server/telegram/bot';

export async function POST() {
  try {
    const admin = await requireAdmin();

    const timestamp = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
    });

    const testMessage =
      `🧪 <b>Тестовое уведомление SAVIN GROUP</b>\n\n` +
      `Бот успешно подключен и отправляет уведомления владельцу.\n` +
      `Инициатор: ${admin.email}\n` +
      `Время сервера (МСК): ${timestamp}\n\n` +
      `<i>Это тестовое сообщение не содержит персональных данных.</i>`;

    const result = await sendTelegramMessage(testMessage);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Не удалось доставить сообщение в Telegram',
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    return NextResponse.json({ error: 'INTERNAL_ERROR', details: String(err) }, { status: 500 });
  }
}
