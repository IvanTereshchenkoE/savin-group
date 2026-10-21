import Decimal from 'decimal.js';
import type { PriceRangeKopeks, PriceRangeRubles } from './types';

// Configure Decimal for financial calculations
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

/**
 * Rounds a Decimal to whole integer kopeks using HALF_UP.
 */
export function roundKopeks(val: Decimal): number {
  return val.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Converts kopeks into integer rubles with:
 * - min rounded down (floor)
 * - max rounded up (ceil)
 */
export function formatPriceRangeRubles(range: PriceRangeKopeks): PriceRangeRubles {
  const minRubles = Math.floor(range.minKopeks / 100);
  const maxRubles = range.maxKopeks !== null ? Math.ceil(range.maxKopeks / 100) : null;

  const minFormatted = new Intl.NumberFormat('ru-RU').format(minRubles);

  let displayFormatted: string;
  if (maxRubles === null) {
    displayFormatted = `от ${minFormatted} ₽, верхняя граница после замера`;
  } else if (minRubles === maxRubles) {
    displayFormatted = `${minFormatted} ₽`;
  } else {
    const maxFormatted = new Intl.NumberFormat('ru-RU').format(maxRubles);
    displayFormatted = `${minFormatted}–${maxFormatted} ₽`;
  }

  return {
    minRubles,
    maxRubles,
    displayFormatted,
  };
}
