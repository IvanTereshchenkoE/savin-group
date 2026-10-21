import type { CalculationResult } from '@/domain/calculator/types';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface TelegramLeadData {
  publicNumber: string;
  city: 'spb' | 'nn';
  type: string;
  name?: string | null;
  phoneE164: string;
  comment?: string | null;
  quote?: CalculationResult | null;
  adminBaseUrl: string;
  leadId: string;
}

export function formatTelegramLeadMessage(data: TelegramLeadData): string {
  const cityName = data.city === 'spb' ? 'Санкт-Петербург' : 'Нижний Новгород';
  const nameSafe = data.name ? escapeHtml(data.name) : 'Не указано';
  const phoneSafe = escapeHtml(data.phoneE164);
  const commentSafe = data.comment ? escapeHtml(data.comment) : '—';
  const sourceSafe = escapeHtml(data.type);

  let msg = `🛠 <b>Новая заявка SAVIN GROUP № ${escapeHtml(data.publicNumber)}</b>\n`;
  msg += `<b>Город:</b> ${cityName}\n`;
  msg += `<b>Источник:</b> ${sourceSafe}\n`;
  msg += `<b>Клиент:</b> ${nameSafe}\n`;
  msg += `<b>Телефон:</b> <code>${phoneSafe}</code>\n\n`;

  if (data.quote && data.quote.lines.length > 0) {
    msg += `<b>Предварительная смета:</b>\n`;
    for (const line of data.quote.lines) {
      const lineTotal =
        line.linePrice.maxKopeks !== null
          ? `${Math.floor(line.linePrice.minKopeks / 100).toLocaleString('ru-RU')}–${Math.ceil(line.linePrice.maxKopeks / 100).toLocaleString('ru-RU')} ₽`
          : `от ${Math.floor(line.linePrice.minKopeks / 100).toLocaleString('ru-RU')} ₽`;
      msg += `• ${escapeHtml(line.title)} — ${escapeHtml(line.quantity)} ${line.unit} — <b>${lineTotal}</b>\n`;
    }

    if (data.quote.surcharges.length > 0) {
      for (const surcharge of data.quote.surcharges) {
        const surTotal =
          surcharge.price.maxKopeks !== null
            ? `${Math.floor(surcharge.price.minKopeks / 100).toLocaleString('ru-RU')}–${Math.ceil(surcharge.price.maxKopeks / 100).toLocaleString('ru-RU')} ₽`
            : `от ${Math.floor(surcharge.price.minKopeks / 100).toLocaleString('ru-RU')} ₽`;
        msg += `• ${escapeHtml(surcharge.title)} (${escapeHtml(surcharge.quantity)} шт) — <b>${surTotal}</b>\n`;
      }
    }

    msg += `\n<b>ИТОГО ЗА РАБОТЫ:</b> <b>${escapeHtml(data.quote.formattedRubles.worksSubtotal.displayFormatted)}</b>\n`;
    if (data.quote.materialsSubtotal) {
      const matFormatted = `${Math.floor(data.quote.materialsSubtotal.minKopeks / 100).toLocaleString('ru-RU')}–${Math.ceil(data.quote.materialsSubtotal.maxKopeks !== null ? data.quote.materialsSubtotal.maxKopeks / 100 : 0).toLocaleString('ru-RU')} ₽`;
      msg += `<b>Материалы (ориентировочно):</b> ${matFormatted}\n`;
    }
    msg += `<b>Прайс-лист:</b> ${escapeHtml(data.quote.priceListVersionId)}\n\n`;
  }

  msg += `<b>Комментарий:</b> ${commentSafe}\n`;
  msg += `🔗 <a href="${data.adminBaseUrl}/leads/${data.leadId}">Открыть в админке</a>`;

  return msg;
}
