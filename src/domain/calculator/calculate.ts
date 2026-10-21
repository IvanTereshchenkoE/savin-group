import Decimal from 'decimal.js';
import { roundKopeks, formatPriceRangeRubles } from './math';
import { calculatorInputSchema } from './schemas';
import type {
  CalculatorInput,
  CalculationResult,
  CalculationLine,
  SurchargeItem,
  PriceListSnapshot,
  ModifierDetail,
  PriceRangeKopeks,
} from './types';

export class CalculatorError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(`[${code}] ${message}`);
    this.name = 'CalculatorError';
  }
}

/**
 * Pure calculation function for Savin Group estimates.
 * Completely deterministic and free of external side-effects (no DB, no network, no React).
 */
export function calculateEstimate(
  rawInput: CalculatorInput,
  priceList: PriceListSnapshot,
): CalculationResult {
  // 1. Zod input validation
  const input = calculatorInputSchema.parse(rawInput);

  // 2. City mismatch check
  if (input.city !== priceList.city) {
    throw new CalculatorError(
      `Несовпадение города: запрос для города "${input.city}", но прайс-лист для "${priceList.city}"`,
      'CITY_MISMATCH',
    );
  }

  // Check if any partition item exists among the requested items
  let hasPartitionItem = false;
  for (const item of input.items) {
    const service = priceList.services[item.serviceCode];
    if (service && service.isPartition) {
      hasPartitionItem = true;
      break;
    }
  }

  // 3. Door openings rule: require at least one partition service
  if (input.doorOpenings > 0 && !hasPartitionItem) {
    throw new CalculatorError(
      'Устройство дверных проемов доступно только при заказе перегородок из ГКЛ',
      'DOOR_OPENINGS_REQUIRE_PARTITIONS',
    );
  }

  const lines: CalculationLine[] = [];
  let evaluatedMaterialsMinKopeks = 0;
  let evaluatedMaterialsMaxKopeks = 0;
  let hasEvaluatedMaterials = false;
  let hasUnpricedItems = false;

  // 4. Process each item
  for (const item of input.items) {
    const service = priceList.services[item.serviceCode];

    if (!service || !service.isEnabled) {
      throw new CalculatorError(
        `Услуга "${item.serviceCode}" недоступна в городе ${priceList.city.toUpperCase()}`,
        'SERVICE_NOT_AVAILABLE_IN_CITY',
      );
    }

    const qty = new Decimal(item.quantity);
    const appliedModifiers: ModifierDetail[] = [];

    let minFactor = new Decimal('1.00');
    let maxFactor = new Decimal('1.00');

    // Height band factor (applies only if service.heightAffected is true)
    if (service.heightAffected) {
      const heightConfig = priceList.heightModifiers[input.ceilingHeightBand];
      if (heightConfig.minFactor !== '1.00' || heightConfig.maxFactor !== '1.00') {
        minFactor = minFactor.times(heightConfig.minFactor);
        maxFactor = maxFactor.times(heightConfig.maxFactor);
        appliedModifiers.push({
          code: 'HEIGHT',
          name: `Высота потолка (${input.ceilingHeightBand})`,
          minFactor: heightConfig.minFactor,
          maxFactor: heightConfig.maxFactor,
        });
      }
    }

    // Box light factor (applies only if box_light option is true AND not already composite light)
    if (item.options?.box_light === true && !service.isCompositeLight) {
      const lightConfig = priceList.options.boxLight;
      minFactor = minFactor.times(lightConfig.minFactor);
      maxFactor = maxFactor.times(lightConfig.maxFactor);
      appliedModifiers.push({
        code: 'BOX_LIGHT',
        name: 'Подсветка короба',
        minFactor: lightConfig.minFactor,
        maxFactor: lightConfig.maxFactor,
      });
    }

    // Base works calculation
    const baseMin = qty.times(service.minPriceKopeks);
    const baseMax = service.maxPriceKopeks !== null ? qty.times(service.maxPriceKopeks) : null;

    let worksMinDecimal = baseMin.times(minFactor);
    let worksMaxDecimal = baseMax !== null ? baseMax.times(maxFactor) : null;

    // Optional acoustic insulation (only if not already composite acoustic)
    if (item.options?.acoustic_insulation === true && !service.isCompositeAcoustic) {
      const acousticConfig = priceList.options.acousticInsulation;
      const acousticWorksMin = qty.times(acousticConfig.worksMinPriceKopeks);
      const acousticWorksMax = qty.times(acousticConfig.worksMaxPriceKopeks);

      worksMinDecimal = worksMinDecimal.plus(acousticWorksMin);
      if (worksMaxDecimal !== null) {
        worksMaxDecimal = worksMaxDecimal.plus(acousticWorksMax);
      }

      // Materials estimate for acoustic insulation
      const matMin = qty.times(acousticConfig.materialsMinPriceKopeks);
      const matMax = qty.times(acousticConfig.materialsMaxPriceKopeks);
      evaluatedMaterialsMinKopeks += roundKopeks(matMin);
      evaluatedMaterialsMaxKopeks += roundKopeks(matMax);
      hasEvaluatedMaterials = true;

      appliedModifiers.push({
        code: 'ACOUSTIC_INSULATION',
        name: 'Шумоизоляция (+165 ₽/м²)',
        minFactor: '1.00',
        maxFactor: '1.00',
      });
    }

    const lineMinKopeks = roundKopeks(worksMinDecimal);
    const lineMaxKopeks = worksMaxDecimal !== null ? roundKopeks(worksMaxDecimal) : null;

    if (lineMaxKopeks === null) {
      hasUnpricedItems = true;
    }

    lines.push({
      serviceCode: service.serviceCode,
      title: service.title,
      unit: service.unit,
      quantity: item.quantity,
      unitPrice: {
        minKopeks: service.minPriceKopeks,
        maxKopeks: service.maxPriceKopeks,
      },
      appliedModifiers,
      linePrice: {
        minKopeks: lineMinKopeks,
        maxKopeks: lineMaxKopeks,
      },
    });
  }

  // 5. Fixed surcharges (e.g. door openings)
  const surcharges: SurchargeItem[] = [];
  if (input.doorOpenings > 0 && priceList.doorOpening.enabled) {
    const minDoorKopeks = input.doorOpenings * priceList.doorOpening.minPriceKopeks;
    const maxDoorKopeks =
      priceList.doorOpening.maxPriceKopeks !== null
        ? input.doorOpenings * priceList.doorOpening.maxPriceKopeks
        : null;

    if (maxDoorKopeks === null) {
      hasUnpricedItems = true;
    }

    surcharges.push({
      code: 'DOOR_OPENINGS',
      title: 'Устройство дверных проемов',
      quantity: String(input.doorOpenings),
      price: {
        minKopeks: minDoorKopeks,
        maxKopeks: maxDoorKopeks,
      },
    });
  }

  // 6. Subtotals and Totals
  let totalWorksMinKopeks = 0;
  let totalWorksMaxKopeks: number | null = 0;

  for (const line of lines) {
    totalWorksMinKopeks += line.linePrice.minKopeks;
    if (line.linePrice.maxKopeks === null) {
      totalWorksMaxKopeks = null;
    } else if (totalWorksMaxKopeks !== null) {
      totalWorksMaxKopeks += line.linePrice.maxKopeks;
    }
  }

  for (const surcharge of surcharges) {
    totalWorksMinKopeks += surcharge.price.minKopeks;
    if (surcharge.price.maxKopeks === null) {
      totalWorksMaxKopeks = null;
    } else if (totalWorksMaxKopeks !== null) {
      totalWorksMaxKopeks += surcharge.price.maxKopeks;
    }
  }

  const worksSubtotal: PriceRangeKopeks = {
    minKopeks: totalWorksMinKopeks,
    maxKopeks: totalWorksMaxKopeks,
  };

  const materialsSubtotal: PriceRangeKopeks | null = hasEvaluatedMaterials
    ? {
        minKopeks: evaluatedMaterialsMinKopeks,
        maxKopeks: evaluatedMaterialsMaxKopeks,
      }
    : null;

  const totalMinKopeks =
    totalWorksMinKopeks + (materialsSubtotal ? materialsSubtotal.minKopeks : 0);

  let totalMaxKopeks: number | null = null;
  if (totalWorksMaxKopeks !== null) {
    if (materialsSubtotal === null) {
      totalMaxKopeks = totalWorksMaxKopeks;
    } else if (materialsSubtotal.maxKopeks !== null) {
      totalMaxKopeks = totalWorksMaxKopeks + materialsSubtotal.maxKopeks;
    }
  }

  const total: PriceRangeKopeks = {
    minKopeks: totalMinKopeks,
    maxKopeks: totalMaxKopeks,
  };

  return {
    priceListVersionId: priceList.versionId,
    algorithmVersion: priceList.algorithmVersion,
    city: input.city,
    lines,
    surcharges,
    worksSubtotal,
    materialsSubtotal,
    total,
    hasUnpricedItems,
    disclaimer:
      'Это предварительный расчет стоимости работ. Окончательная смета определяется после выезда специалиста и замера объекта.',
    formattedRubles: {
      worksSubtotal: formatPriceRangeRubles(worksSubtotal),
      total: formatPriceRangeRubles(total),
    },
  };
}
