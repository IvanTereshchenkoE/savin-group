import { z } from 'zod';
import Decimal from 'decimal.js';

export const citySchema = z.enum(['spb', 'nn']);

export const unitSchema = z.enum(['M2', 'LINEAR_M', 'PCS']);

export const ceilingHeightBandSchema = z.enum(['UP_TO_3', 'FROM_3_TO_3_5', 'ABOVE_3_5']);

/**
 * Validates a string quantity:
 * - Must be a valid positive decimal string (e.g. "15", "12.5")
 * - Strictly greater than 0
 * - Maximum 100,000 (DoS / overflow prevention)
 * - Maximum 3 decimal places
 */
export const quantitySchema = z
  .string()
  .trim()
  .min(1, 'Количество обязательно для заполнения')
  .refine(
    (val) => {
      try {
        const d = new Decimal(val);
        return d.isFinite() && d.greaterThan(0);
      } catch {
        return false;
      }
    },
    { message: 'Количество должно быть положительным числом больше 0' },
  )
  .refine(
    (val) => {
      try {
        const d = new Decimal(val);
        return d.lessThanOrEqualTo(100000);
      } catch {
        return false;
      }
    },
    { message: 'Количество превышает допустимый максимум (100 000)' },
  )
  .refine(
    (val) => {
      try {
        const d = new Decimal(val);
        return d.decimalPlaces() <= 3;
      } catch {
        return false;
      }
    },
    { message: 'Количество не может содержать более 3 знаков после запятой' },
  );

export const calculatorItemInputSchema = z.object({
  serviceCode: z.string().trim().min(1, 'Код услуги обязателен'),
  quantity: quantitySchema,
  options: z
    .object({
      acoustic_insulation: z.boolean().optional(),
      box_light: z.boolean().optional(),
    })
    .catchall(z.union([z.boolean(), z.string(), z.number()]))
    .optional(),
});

export const calculatorInputSchema = z.object({
  city: citySchema,
  items: z.array(calculatorItemInputSchema).min(1, 'Необходимо выбрать хотя бы одну услугу'),
  ceilingHeightBand: ceilingHeightBandSchema,
  doorOpenings: z.number().int().min(0, 'Количество проемов не может быть отрицательным').max(100),
  comment: z.string().max(1000).optional(),
});

export const priceListItemSchema = z
  .object({
    serviceCode: z.string().min(1),
    title: z.string().min(1),
    category: z.enum(['gkl', 'painting']),
    unit: unitSchema,
    minPriceKopeks: z.number().int().min(0, 'Минимальная цена не может быть отрицательной'),
    maxPriceKopeks: z.number().int().nullable(),
    isEnabled: z.boolean(),
    heightAffected: z.boolean(),
    isPartition: z.boolean().optional(),
    isCompositeAcoustic: z.boolean().optional(),
    isCompositeLight: z.boolean().optional(),
  })
  .refine(
    (item) => {
      if (item.maxPriceKopeks === null) return true;
      return item.maxPriceKopeks >= item.minPriceKopeks;
    },
    {
      message: 'Максимальная цена не может быть меньше минимальной цены',
      path: ['maxPriceKopeks'],
    },
  );
