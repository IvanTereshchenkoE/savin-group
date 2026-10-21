export interface SendTelegramResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryable?: boolean;
}

export async function sendTelegramMessage(text: string): Promise<SendTelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // If not configured, log warning and treat as non-fatal during local dev
    console.warn(
      '[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing. Notification skipped.',
    );
    return {
      success: false,
      error: 'TELEGRAM_CONFIG_MISSING',
      retryable: false,
    };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = (await response.json()) as {
      ok: boolean;
      result?: { message_id: number };
      description?: string;
    };

    if (!response.ok || !data.ok) {
      const isRetryable = response.status >= 500 || response.status === 429;
      return {
        success: false,
        error: data.description || `HTTP ${response.status}`,
        retryable: isRetryable,
      };
    }

    return {
      success: true,
      messageId: String(data.result?.message_id),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errorMsg,
      retryable: true,
    };
  }
}
