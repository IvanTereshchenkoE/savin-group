export type City = 'spb' | 'nn';

export type Unit = 'M2' | 'LINEAR_M' | 'PCS';

export type CeilingHeightBand = 'UP_TO_3' | 'FROM_3_TO_3_5' | 'ABOVE_3_5';

export interface PriceRangeKopeks {
  minKopeks: number;
  maxKopeks: number | null;
}

export interface PriceRangeRubles {
  minRubles: number;
  maxRubles: number | null;
  displayFormatted: string;
}

export interface CalculatorItemInput {
  serviceCode: string;
  /** Decimal string, e.g. "15", "12.5" */
  quantity: string;
  options?: {
    acoustic_insulation?: boolean;
    box_light?: boolean;
    [key: string]: boolean | string | number | undefined;
  };
}

export interface CalculatorInput {
  city: City;
  items: CalculatorItemInput[];
  ceilingHeightBand: CeilingHeightBand;
  doorOpenings: number;
  comment?: string;
}

export interface ModifierDetail {
  code: string;
  name: string;
  minFactor: string;
  maxFactor: string;
}

export interface CalculationLine {
  serviceCode: string;
  title: string;
  unit: Unit;
  quantity: string;
  unitPrice: PriceRangeKopeks;
  appliedModifiers: ModifierDetail[];
  linePrice: PriceRangeKopeks;
}

export interface SurchargeItem {
  code: string;
  title: string;
  quantity: string;
  price: PriceRangeKopeks;
}

export interface CalculationResult {
  priceListVersionId: string;
  algorithmVersion: string;
  city: City;
  lines: CalculationLine[];
  surcharges: SurchargeItem[];
  worksSubtotal: PriceRangeKopeks;
  materialsSubtotal: PriceRangeKopeks | null;
  total: PriceRangeKopeks;
  hasUnpricedItems: boolean;
  disclaimer: string;
  formattedRubles: {
    worksSubtotal: PriceRangeRubles;
    total: PriceRangeRubles;
  };
}

export interface PriceListItem {
  serviceCode: string;
  title: string;
  category: 'gkl' | 'painting';
  unit: Unit;
  minPriceKopeks: number;
  maxPriceKopeks: number | null;
  isEnabled: boolean;
  heightAffected: boolean;
  isPartition?: boolean;
  isCompositeAcoustic?: boolean;
  isCompositeLight?: boolean;
}

export interface HeightModifierConfig {
  minFactor: string;
  maxFactor: string;
}

export interface DoorOpeningConfig {
  enabled: boolean;
  minPriceKopeks: number;
  maxPriceKopeks: number;
}

export interface SmallVolumeModifierConfig {
  enabled: boolean;
  thresholdM2: string;
  minFactor: string;
  maxFactor: string;
}

export interface AcousticOptionConfig {
  worksMinPriceKopeks: number;
  worksMaxPriceKopeks: number;
  materialsMinPriceKopeks: number;
  materialsMaxPriceKopeks: number;
}

export interface BoxLightOptionConfig {
  minFactor: string;
  maxFactor: string;
}

export interface PriceListSnapshot {
  versionId: string;
  algorithmVersion: string;
  city: City;
  services: Record<string, PriceListItem>;
  heightModifiers: Record<CeilingHeightBand, HeightModifierConfig>;
  doorOpening: DoorOpeningConfig;
  smallVolumeModifier: SmallVolumeModifierConfig;
  options: {
    acousticInsulation: AcousticOptionConfig;
    boxLight: BoxLightOptionConfig;
  };
}
