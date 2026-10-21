import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTelegramMessage } from '../bot';

describe('Telegram Bot Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('skips gracefully if environment variables are missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;

    const result = await sendTelegramMessage('test message');
    expect(result.success).toBe(false);
    expect(result.error).toBe('TELEGRAM_CONFIG_MISSING');
  });

  it('sends message successfully when Bot API returns ok', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-token';
    process.env.TELEGRAM_CHAT_ID = '123456';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, result: { message_id: 999 } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await sendTelegramMessage('Hello Telegram');
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('999');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/botmock-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('handles Telegram API error response with retry flag', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-token';
    process.env.TELEGRAM_CHAT_ID = '123456';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ ok: false, description: 'Bad Gateway' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await sendTelegramMessage('Hello Telegram');
    expect(result.success).toBe(false);
    expect(result.retryable).toBe(true);
    expect(result.error).toBe('Bad Gateway');
  });
});
