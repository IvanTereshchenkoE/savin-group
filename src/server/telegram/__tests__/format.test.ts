import { describe, it, expect } from 'vitest';
import { formatTelegramLeadMessage, escapeHtml } from '../format';
import { calculateEstimate } from '@/domain/calculator/calculate';
import { SEED_PRICE_LIST_SPB } from '@/domain/calculator/seed';

describe('Telegram Lead Message Formatter', () => {
  it('escapes HTML special characters correctly', () => {
    expect(escapeHtml('<script>alert("xss") & test</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;) &amp; test&lt;/script&gt;',
    );
  });

  it('formats a complete lead message with calculated quote', () => {
    const quote = calculateEstimate(
      {
        city: 'spb',
        items: [{ serviceCode: 'partition_single', quantity: '15' }],
        ceilingHeightBand: 'UP_TO_3',
        doorOpenings: 0,
      },
      SEED_PRICE_LIST_SPB,
    );

    const message = formatTelegramLeadMessage({
      publicNumber: 'SG-2026-000123',
      city: 'spb',
      type: 'CALCULATOR',
      name: 'Иван & Партнеры',
      phoneE164: '+79991234567',
      comment: 'Нужен замер <срочно>',
      quote,
      adminBaseUrl: 'https://admin.savin-group.ru',
      leadId: 'test-lead-uuid-1',
    });

    expect(message).toContain('🛠 <b>Новая заявка SAVIN GROUP № SG-2026-000123</b>');
    expect(message).toContain('<b>Город:</b> Санкт-Петербург');
    expect(message).toContain('Иван &amp; Партнеры');
    expect(message).toContain('<code>+79991234567</code>');
    expect(message).toContain('Перегородка ГКЛ в 1 слой с двух сторон');
    expect(message).toContain('14 850–24 750 ₽');
    expect(message).toContain('ИТОГО ЗА РАБОТЫ:');
    expect(message).toContain('https://admin.savin-group.ru/leads/test-lead-uuid-1');
  });

  it('formats callback lead message without quote', () => {
    const message = formatTelegramLeadMessage({
      publicNumber: 'SG-2026-CALLBACK',
      city: 'nn',
      type: 'CALLBACK',
      name: null,
      phoneE164: '+79876543210',
      comment: null,
      quote: null,
      adminBaseUrl: 'https://admin.savin-group.ru',
      leadId: 'lead-2',
    });

    expect(message).toContain('SG-2026-CALLBACK');
    expect(message).toContain('Нижний Новгород');
    expect(message).toContain('Не указано');
    expect(message).toContain('<code>+79876543210</code>');
    expect(message).not.toContain('Предварительная смета');
  });
});
