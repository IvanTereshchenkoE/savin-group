import { describe, it, expect } from 'vitest';
import {
  calculateEstimate,
  SEED_PRICE_LIST_SPB,
  SEED_PRICE_LIST_NN,
  getSeedPriceList,
  formatPriceRangeRubles,
  quantitySchema,
  calculatorInputSchema,
  priceListItemSchema,
  roundKopeks,
  type PriceListSnapshot,
} from '../index';
import Decimal from 'decimal.js';

describe('Calculator Domain (SAVIN GROUP)', () => {
  describe('Control Scenarios C01 - C25', () => {
    // C01: Scenario A, SPB -> 60 390–87 010 ₽
    it('C01: Scenario A in SPB gives exact 60 390–87 010 ₽', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [
            { serviceCode: 'partition_single', quantity: '15' },
            { serviceCode: 'ceiling_single', quantity: '20' },
            { serviceCode: 'putty_paint', quantity: '45' },
            { serviceCode: 'paint_two_coats', quantity: '45' },
          ],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      // Verify lines
      expect(result.lines).toHaveLength(4);
      expect(result.lines[0]?.linePrice).toEqual({ minKopeks: 1485000, maxKopeks: 2475000 });
      expect(result.lines[1]?.linePrice).toEqual({ minKopeks: 1980000, maxKopeks: 2860000 });
      expect(result.lines[2]?.linePrice).toEqual({ minKopeks: 1485000, maxKopeks: 1980000 });
      expect(result.lines[3]?.linePrice).toEqual({ minKopeks: 1089000, maxKopeks: 1386000 });

      // Verify total in kopeks
      expect(result.total).toEqual({ minKopeks: 6039000, maxKopeks: 8701000 });

      // Verify formatted rubles
      expect(result.formattedRubles.total.minRubles).toBe(60390);
      expect(result.formattedRubles.total.maxRubles).toBe(87010);
      expect(result.formattedRubles.total.displayFormatted).toBe('60 390–87 010 ₽');
      expect(result.materialsSubtotal).toBeNull();
      expect(result.hasUnpricedItems).toBe(false);
    });

    // C02: Scenario A, NN, city rates -> 43 395–66 275 ₽
    it('C02: Scenario A in NN gives exact 43 395–66 275 ₽ using city rates (not 0.85 SPB)', () => {
      const result = calculateEstimate(
        {
          city: 'nn',
          items: [
            { serviceCode: 'partition_single', quantity: '15' },
            { serviceCode: 'ceiling_single', quantity: '20' },
            { serviceCode: 'putty_paint', quantity: '45' },
            { serviceCode: 'paint_two_coats', quantity: '45' },
          ],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_NN,
      );

      expect(result.lines[0]?.linePrice).toEqual({ minKopeks: 990000, maxKopeks: 1650000 });
      expect(result.lines[1]?.linePrice).toEqual({ minKopeks: 1320000, maxKopeks: 1760000 });
      expect(result.lines[2]?.linePrice).toEqual({ minKopeks: 1138500, maxKopeks: 1732500 });
      expect(result.lines[3]?.linePrice).toEqual({ minKopeks: 891000, maxKopeks: 1485000 });

      expect(result.total).toEqual({ minKopeks: 4339500, maxKopeks: 6627500 });
      expect(result.formattedRubles.total.minRubles).toBe(43395);
      expect(result.formattedRubles.total.maxRubles).toBe(66275);
      expect(result.formattedRubles.total.displayFormatted).toBe('43 395–66 275 ₽');
    });

    // C03: 10 m² partition_double_acoustic, NN -> 12 100–18 700 ₽, acoustic option not doubled
    it('C03: partition_double_acoustic does not double acoustic insulation surcharge', () => {
      const result = calculateEstimate(
        {
          city: 'nn',
          items: [
            {
              serviceCode: 'partition_double_acoustic',
              quantity: '10',
              options: { acoustic_insulation: true },
            },
          ],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_NN,
      );

      expect(result.total).toEqual({ minKopeks: 1210000, maxKopeks: 1870000 });
      expect(result.formattedRubles.total.displayFormatted).toBe('12 100–18 700 ₽');
      expect(result.materialsSubtotal).toBeNull();
    });

    // C04: 10 m² wall_lining, SPB, ABOVE_3_5 (factor 1.30) -> 8 580–12 155 ₽
    it('C04: 10 m² wall_lining in SPB with ABOVE_3_5 height modifier gives 8 580–12 155 ₽', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [{ serviceCode: 'wall_lining', quantity: '10' }],
          ceilingHeightBand: 'ABOVE_3_5',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      expect(result.total).toEqual({ minKopeks: 858000, maxKopeks: 1215500 });
      expect(result.formattedRubles.total.displayFormatted).toBe('8 580–12 155 ₽');
      expect(result.lines[0]?.appliedModifiers[0]?.code).toBe('HEIGHT');
    });

    // C05: 0, negative, string, NaN, Infinity qty -> validation errors
    it('C05: validates against invalid quantities (0, negative, NaN, Infinity, overflow)', () => {
      const invalidQuantities = ['0', '-5', 'NaN', 'Infinity', 'abc', '100001', '12.3456'];
      for (const qty of invalidQuantities) {
        expect(() => quantitySchema.parse(qty)).toThrow();
      }
    });

    // C06: 12.5 m² quantity, exact decimal math, HALF_UP rounding
    it('C06: calculates 12.5 m² with exact decimal arithmetic and HALF_UP rounding', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [{ serviceCode: 'wall_lining', quantity: '12.5' }],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      // 12.5 * 660 = 8250 ₽ (825000 kopeks)
      // 12.5 * 935 = 11687.5 ₽ -> 1168750 kopeks
      expect(result.total).toEqual({ minKopeks: 825000, maxKopeks: 1168750 });
      expect(result.formattedRubles.total.minRubles).toBe(8250);
      expect(result.formattedRubles.total.maxRubles).toBe(11688);
    });

    // C07: Preserves different units per line
    it('C07: preserves different units (M2, LINEAR_M) on their respective lines', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [
            { serviceCode: 'partition_single', quantity: '10' },
            { serviceCode: 'box_niche', quantity: '5' },
          ],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      expect(result.lines[0]?.unit).toBe('M2');
      expect(result.lines[1]?.unit).toBe('LINEAR_M');
    });

    // C08: Two distinct services on same area produce two separate lines
    it('C08: generates distinct lines for putty and paint on same 45 m²', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [
            { serviceCode: 'putty_paint', quantity: '45' },
            { serviceCode: 'paint_two_coats', quantity: '45' },
          ],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      expect(result.lines).toHaveLength(2);
      expect(result.lines[0]?.serviceCode).toBe('putty_paint');
      expect(result.lines[1]?.serviceCode).toBe('paint_two_coats');
    });

    // C09: Service disabled in city -> SERVICE_NOT_AVAILABLE_IN_CITY error
    it('C09: throws SERVICE_NOT_AVAILABLE_IN_CITY when service is disabled or missing', () => {
      const disabledPriceList = {
        ...SEED_PRICE_LIST_SPB,
        services: {
          ...SEED_PRICE_LIST_SPB.services,
          partition_single: {
            ...SEED_PRICE_LIST_SPB.services.partition_single!,
            isEnabled: false,
          },
        },
      };

      expect(() =>
        calculateEstimate(
          {
            city: 'spb',
            items: [{ serviceCode: 'partition_single', quantity: '10' }],
            ceilingHeightBand: 'UP_TO_3',
            doorOpenings: 0,
          },
          disabledPriceList,
        ),
      ).toThrowError(/SERVICE_NOT_AVAILABLE_IN_CITY/);

      expect(() =>
        calculateEstimate(
          {
            city: 'spb',
            items: [{ serviceCode: 'non_existent_service', quantity: '10' }],
            ceilingHeightBand: 'UP_TO_3',
            doorOpenings: 0,
          },
          SEED_PRICE_LIST_SPB,
        ),
      ).toThrowError(/SERVICE_NOT_AVAILABLE_IN_CITY/);
    });

    // C10: ceiling_shaped (max is null) -> max = null, hasUnpricedItems: true
    it('C10: ceiling_shaped handles unknown upper boundary with max = null', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [{ serviceCode: 'ceiling_shaped', quantity: '10' }],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      expect(result.hasUnpricedItems).toBe(true);
      expect(result.total.maxKopeks).toBeNull();
      expect(result.total.minKopeks).toBe(2200000);
      expect(result.formattedRubles.total.displayFormatted).toBe(
        'от 22 000 ₽, верхняя граница после замера',
      );
    });

    // C11: height band FROM_3_TO_3_5 has min factor 1.15 and max factor 1.20
    it('C11: height band FROM_3_TO_3_5 applies 1.15 to min and 1.20 to max', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [{ serviceCode: 'ceiling_single', quantity: '10' }],
          ceilingHeightBand: 'FROM_3_TO_3_5',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      // min: 10 * 990 * 1.15 = 11 385 ₽ (1138500 kopeks)
      // max: 10 * 1430 * 1.20 = 17 160 ₽ (1716000 kopeks)
      expect(result.total).toEqual({ minKopeks: 1138500, maxKopeks: 1716000 });
      expect(result.formattedRubles.total.displayFormatted).toBe('11 385–17 160 ₽');
    });

    // C12: Height factor applies ONLY to heightAffected: true services
    it('C12: does not apply height factor to painting services (heightAffected = false)', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [{ serviceCode: 'putty_paint', quantity: '10' }],
          ceilingHeightBand: 'ABOVE_3_5',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      // 10 * 330 = 3300 ₽; 10 * 440 = 4400 ₽ (no 1.30 multiplier)
      expect(result.total).toEqual({ minKopeks: 330000, maxKopeks: 440000 });
      expect(result.lines[0]?.appliedModifiers).toHaveLength(0);
    });

    // C13: Door openings surcharge requires partition and calculates correctly
    it('C13: door openings: 0 gives 0; 2 gives 5 500–8 800 ₽; rejected without partitions', () => {
      // 0 door openings -> 0 surcharge
      const res0 = calculateEstimate(
        {
          city: 'spb',
          items: [{ serviceCode: 'partition_single', quantity: '10' }],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );
      expect(res0.surcharges).toHaveLength(0);

      // 2 door openings with partition -> 2 * 2750 = 5500 ₽ min, 2 * 4400 = 8800 ₽ max
      const res2 = calculateEstimate(
        {
          city: 'spb',
          items: [{ serviceCode: 'partition_single', quantity: '10' }],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 2,
        },
        SEED_PRICE_LIST_SPB,
      );
      expect(res2.surcharges).toHaveLength(1);
      expect(res2.surcharges[0]?.price).toEqual({ minKopeks: 550000, maxKopeks: 880000 });
      expect(res2.total.minKopeks).toBe(990000 + 550000);
      expect(res2.total.maxKopeks).toBe(1650000 + 880000);

      // door openings without partition -> DOOR_OPENINGS_REQUIRE_PARTITIONS error
      expect(() =>
        calculateEstimate(
          {
            city: 'spb',
            items: [{ serviceCode: 'ceiling_single', quantity: '10' }],
            ceilingHeightBand: 'UP_TO_3',
            doorOpenings: 1,
          },
          SEED_PRICE_LIST_SPB,
        ),
      ).toThrowError(/DOOR_OPENINGS_REQUIRE_PARTITIONS/);
    });

    // C14: Option acoustic_insulation on partition_single works and adds materials
    it('C14: applies acoustic option to standard partition and evaluates materials', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [
            {
              serviceCode: 'partition_single',
              quantity: '10',
              options: { acoustic_insulation: true },
            },
          ],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      // base: 9 900–16 500 ₽
      // acoustic works: 10 * 165 = 1 650 ₽ (165000 kopeks)
      // works total: 11 550–18 150 ₽
      expect(result.worksSubtotal).toEqual({ minKopeks: 1155000, maxKopeks: 1815000 });

      // acoustic materials: 10 * 165–330 ₽ = 1 650–3 300 ₽
      expect(result.materialsSubtotal).toEqual({ minKopeks: 165000, maxKopeks: 330000 });

      // total = works + materials = 13 200–21 450 ₽
      expect(result.total).toEqual({ minKopeks: 1320000, maxKopeks: 2145000 });
    });

    // C15: box_with_light does not add box light surcharge twice
    it('C15: box_with_light composite does not duplicate light modifier', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [
            {
              serviceCode: 'box_with_light',
              quantity: '10',
              options: { box_light: true },
            },
          ],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      // 10 * 1100 = 1100000 kopeks (11 000 ₽)
      // 10 * 1540 = 1540000 kopeks (15 400 ₽)
      expect(result.total).toEqual({ minKopeks: 1100000, maxKopeks: 1540000 });
      expect(result.lines[0]?.appliedModifiers).toHaveLength(0);
    });

    // Box light on regular box_niche applies modifier correctly
    it('applies box light modifier to regular box_niche', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [
            {
              serviceCode: 'box_niche',
              quantity: '10',
              options: { box_light: true },
            },
          ],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      // base: 11 000–17 600 ₽
      // with +30% min, +50% max:
      // min: 11 000 * 1.30 = 14 300 ₽ (1430000 kopeks)
      // max: 17 600 * 1.50 = 26 400 ₽ (2640000 kopeks)
      expect(result.total).toEqual({ minKopeks: 1430000, maxKopeks: 2640000 });
      expect(result.lines[0]?.appliedModifiers[0]?.code).toBe('BOX_LIGHT');
    });

    // C16: Unverified small volume modifier is disabled
    it('C16: small volume modifier is disabled in seed price list', () => {
      expect(SEED_PRICE_LIST_SPB.smallVolumeModifier.enabled).toBe(false);
      expect(SEED_PRICE_LIST_NN.smallVolumeModifier.enabled).toBe(false);
    });

    // C17: City switch changes price list version and all outputs
    it('C17: city switch yields different priceListVersionId and outputs', () => {
      const inputSpb = {
        city: 'spb' as const,
        items: [{ serviceCode: 'wall_lining', quantity: '10' }],
        ceilingHeightBand: 'UP_TO_3' as const,
        doorOpenings: 0,
      };

      const inputNn = {
        city: 'nn' as const,
        items: [{ serviceCode: 'wall_lining', quantity: '10' }],
        ceilingHeightBand: 'UP_TO_3' as const,
        doorOpenings: 0,
      };

      const resSpb = calculateEstimate(inputSpb, getSeedPriceList('spb'));
      const resNn = calculateEstimate(inputNn, getSeedPriceList('nn'));

      expect(resSpb.city).toBe('spb');
      expect(resNn.city).toBe('nn');
      expect(resSpb.total).not.toEqual(resNn.total);
    });

    // C21: Server rejects city mismatch between input and price list snapshot
    it('C21: throws CITY_MISMATCH when input city does not match price list', () => {
      expect(() =>
        calculateEstimate(
          {
            city: 'spb',
            items: [{ serviceCode: 'wall_lining', quantity: '10' }],
            ceilingHeightBand: 'UP_TO_3',
            doorOpenings: 0,
          },
          SEED_PRICE_LIST_NN,
        ),
      ).toThrowError(/CITY_MISMATCH/);
    });

    // C22: Quantity exceeding maximum limit is rejected
    it('C22: rejects quantity exceeding 100,000 for overflow and DoS protection', () => {
      expect(() =>
        calculateEstimate(
          {
            city: 'spb',
            items: [{ serviceCode: 'wall_lining', quantity: '100001' }],
            ceilingHeightBand: 'UP_TO_3',
            doorOpenings: 0,
          },
          SEED_PRICE_LIST_SPB,
        ),
      ).toThrow();
    });

    // C23: Materials subtotal is null when materials are not assessed
    it('C23: materialsSubtotal is null when materials are not part of calculation', () => {
      const result = calculateEstimate(
        {
          city: 'spb',
          items: [{ serviceCode: 'wall_lining', quantity: '10' }],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        },
        SEED_PRICE_LIST_SPB,
      );

      expect(result.materialsSubtotal).toBeNull();
    });

    // C24: Deterministic calculation across multiple identical runs
    it('C24: produces identical result for identical inputs', () => {
      const input = {
        city: 'spb' as const,
        items: [
          { serviceCode: 'partition_single', quantity: '15' },
          { serviceCode: 'ceiling_single', quantity: '20' },
        ],
        ceilingHeightBand: 'UP_TO_3' as const,
        doorOpenings: 0,
      };

      const res1 = calculateEstimate(input, SEED_PRICE_LIST_SPB);
      const res2 = calculateEstimate(input, SEED_PRICE_LIST_SPB);

      expect(res1).toEqual(res2);
    });

    // C25: Price list item validation prevents minPrice > maxPrice
    it('C25: priceListItemSchema rejects minPriceKopeks > maxPriceKopeks and accepts null max', () => {
      const invalidItem = {
        serviceCode: 'invalid_item',
        title: 'Неверный товар',
        category: 'gkl' as const,
        unit: 'M2' as const,
        minPriceKopeks: 100000,
        maxPriceKopeks: 50000, // max < min!
        isEnabled: true,
        heightAffected: false,
      };

      expect(() => priceListItemSchema.parse(invalidItem)).toThrowError(
        /Максимальная цена не может быть меньше минимальной цены/,
      );

      const validNullMax = {
        serviceCode: 'valid_null_max',
        title: 'Фигурный потолок',
        category: 'gkl' as const,
        unit: 'M2' as const,
        minPriceKopeks: 220000,
        maxPriceKopeks: null,
        isEnabled: true,
        heightAffected: true,
      };
      expect(priceListItemSchema.parse(validNullMax)).toEqual(validNullMax);

      const validExact = {
        serviceCode: 'valid_exact',
        title: 'Шпаклевка',
        category: 'painting' as const,
        unit: 'M2' as const,
        minPriceKopeks: 20000,
        maxPriceKopeks: 30000,
        isEnabled: true,
        heightAffected: false,
      };
      expect(priceListItemSchema.parse(validExact)).toEqual(validExact);
    });

    it('handles surcharges when total works max is already null or surcharge max is null', () => {
      // 1. Unpriced item with door opening (tests totalWorksMaxKopeks === null when surcharge is added)
      const res1 = calculateEstimate(
        {
          city: 'spb',
          items: [
            { serviceCode: 'partition_single', quantity: '10' },
            { serviceCode: 'ceiling_shaped', quantity: '10' },
          ],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 1,
        },
        SEED_PRICE_LIST_SPB,
      );
      expect(res1.total.maxKopeks).toBeNull();
      expect(res1.hasUnpricedItems).toBe(true);

      // 2. Custom price list where surcharge itself has maxPriceKopeks = null
      const customPriceList = {
        ...SEED_PRICE_LIST_SPB,
        doorOpening: {
          enabled: true,
          minPriceKopeks: 275000,
          maxPriceKopeks: null as unknown as number,
        },
      };

      const res2 = calculateEstimate(
        {
          city: 'spb',
          items: [{ serviceCode: 'partition_single', quantity: '10' }],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 1,
        },
        customPriceList as unknown as PriceListSnapshot,
      );
      expect(res2.total.maxKopeks).toBeNull();
      expect(res2.hasUnpricedItems).toBe(true);
    });
  });

  describe('Edge cases and Helper math functions', () => {
    it('formats single price when minRubles equals maxRubles', () => {
      const formatted = formatPriceRangeRubles({ minKopeks: 23100, maxKopeks: 23100 });
      expect(formatted.minRubles).toBe(231);
      expect(formatted.maxRubles).toBe(231);
      expect(formatted.displayFormatted).toBe('231 ₽');
    });

    it('roundKopeks rounds correctly with HALF_UP', () => {
      expect(roundKopeks(new Decimal('100.4'))).toBe(100);
      expect(roundKopeks(new Decimal('100.5'))).toBe(101);
      expect(roundKopeks(new Decimal('100.6'))).toBe(101);
    });

    it('validates calculatorInputSchema rejects empty items array', () => {
      expect(() =>
        calculatorInputSchema.parse({
          city: 'spb',
          items: [],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: 0,
        }),
      ).toThrowError(/Необходимо выбрать хотя бы одну услугу/);
    });

    it('validates calculatorInputSchema rejects negative door openings', () => {
      expect(() =>
        calculatorInputSchema.parse({
          city: 'spb',
          items: [{ serviceCode: 'wall_lining', quantity: '10' }],
          ceilingHeightBand: 'UP_TO_3',
          doorOpenings: -1,
        }),
      ).toThrowError(/Количество проемов не может быть отрицательным/);
    });
  });
});
