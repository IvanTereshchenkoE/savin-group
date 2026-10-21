import type { PriceListSnapshot, PriceListItem, City } from './types';

const COMMON_HEIGHT_MODIFIERS = {
  UP_TO_3: { minFactor: '1.00', maxFactor: '1.00' },
  FROM_3_TO_3_5: { minFactor: '1.15', maxFactor: '1.20' },
  ABOVE_3_5: { minFactor: '1.30', maxFactor: '1.30' },
};

const COMMON_OPTIONS = {
  acousticInsulation: {
    worksMinPriceKopeks: 16500, // +165 ₽/м²
    worksMaxPriceKopeks: 16500,
    materialsMinPriceKopeks: 16500, // +165 ₽/м²
    materialsMaxPriceKopeks: 33000, // +330 ₽/м²
  },
  boxLight: {
    minFactor: '1.30', // +30%
    maxFactor: '1.50', // +50%
  },
};

const COMMON_DOOR_OPENING = {
  enabled: true,
  minPriceKopeks: 275000, // +2 750 ₽/шт
  maxPriceKopeks: 440000, // +4 400 ₽/шт
};

const COMMON_SMALL_VOLUME = {
  enabled: false,
  thresholdM2: '30',
  minFactor: '1.20',
  maxFactor: '1.30',
};

const SPB_SERVICES: Record<string, PriceListItem> = {
  partition_single: {
    serviceCode: 'partition_single',
    title: 'Перегородка ГКЛ в 1 слой с двух сторон',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 99000,
    maxPriceKopeks: 165000,
    isEnabled: true,
    heightAffected: true,
    isPartition: true,
  },
  partition_double_acoustic: {
    serviceCode: 'partition_double_acoustic',
    title: 'Перегородка ГКЛ 2 слоя с шумоизоляцией',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 198000,
    maxPriceKopeks: 264000,
    isEnabled: true,
    heightAffected: true,
    isPartition: true,
    isCompositeAcoustic: true,
  },
  wall_lining: {
    serviceCode: 'wall_lining',
    title: 'Обшивка стены ГКЛ',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 66000,
    maxPriceKopeks: 93500,
    isEnabled: true,
    heightAffected: true,
  },
  box_niche: {
    serviceCode: 'box_niche',
    title: 'Короб / ниша',
    category: 'gkl',
    unit: 'LINEAR_M',
    minPriceKopeks: 110000,
    maxPriceKopeks: 176000,
    isEnabled: true,
    heightAffected: false,
  },
  ceiling_single: {
    serviceCode: 'ceiling_single',
    title: 'Потолок одноуровневый',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 99000,
    maxPriceKopeks: 143000,
    isEnabled: true,
    heightAffected: true,
  },
  ceiling_double: {
    serviceCode: 'ceiling_double',
    title: 'Потолок двухуровневый',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 154000,
    maxPriceKopeks: 209000,
    isEnabled: true,
    heightAffected: true,
  },
  ceiling_shaped: {
    serviceCode: 'ceiling_shaped',
    title: 'Фигурный потолок',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 220000,
    maxPriceKopeks: null, // верхняя граница неизвестна
    isEnabled: true,
    heightAffected: true,
  },
  box_with_light: {
    serviceCode: 'box_with_light',
    title: 'Короб с подсветкой',
    category: 'gkl',
    unit: 'LINEAR_M',
    minPriceKopeks: 110000,
    maxPriceKopeks: 154000,
    isEnabled: true,
    heightAffected: false,
    isCompositeLight: true,
  },
  putty_wallpaper: {
    serviceCode: 'putty_wallpaper',
    title: 'Шпаклёвка под обои',
    category: 'painting',
    unit: 'M2',
    minPriceKopeks: 22000,
    maxPriceKopeks: 27500,
    isEnabled: true,
    heightAffected: false,
  },
  putty_paint: {
    serviceCode: 'putty_paint',
    title: 'Шпаклёвка под покраску',
    category: 'painting',
    unit: 'M2',
    minPriceKopeks: 33000,
    maxPriceKopeks: 44000,
    isEnabled: true,
    heightAffected: false,
  },
  paint_two_coats: {
    serviceCode: 'paint_two_coats',
    title: 'Покраска в 2 слоя',
    category: 'painting',
    unit: 'M2',
    minPriceKopeks: 24200,
    maxPriceKopeks: 30800,
    isEnabled: true,
    heightAffected: false,
  },
};

const NN_SERVICES: Record<string, PriceListItem> = {
  partition_single: {
    serviceCode: 'partition_single',
    title: 'Перегородка ГКЛ в 1 слой с двух сторон',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 66000,
    maxPriceKopeks: 110000,
    isEnabled: true,
    heightAffected: true,
    isPartition: true,
  },
  partition_double_acoustic: {
    serviceCode: 'partition_double_acoustic',
    title: 'Перегородка ГКЛ 2 слоя с шумоизоляцией',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 121000,
    maxPriceKopeks: 187000,
    isEnabled: true,
    heightAffected: true,
    isPartition: true,
    isCompositeAcoustic: true,
  },
  wall_lining: {
    serviceCode: 'wall_lining',
    title: 'Обшивка стены ГКЛ',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 44000,
    maxPriceKopeks: 77000,
    isEnabled: true,
    heightAffected: true,
  },
  box_niche: {
    serviceCode: 'box_niche',
    title: 'Короб / ниша',
    category: 'gkl',
    unit: 'LINEAR_M',
    minPriceKopeks: 88000,
    maxPriceKopeks: 132000,
    isEnabled: true,
    heightAffected: false,
  },
  ceiling_single: {
    serviceCode: 'ceiling_single',
    title: 'Потолок одноуровневый',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 66000,
    maxPriceKopeks: 88000,
    isEnabled: true,
    heightAffected: true,
  },
  ceiling_double: {
    serviceCode: 'ceiling_double',
    title: 'Потолок двухуровневый',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 110000,
    maxPriceKopeks: 143000,
    isEnabled: true,
    heightAffected: true,
  },
  ceiling_shaped: {
    serviceCode: 'ceiling_shaped',
    title: 'Фигурный потолок',
    category: 'gkl',
    unit: 'M2',
    minPriceKopeks: 165000,
    maxPriceKopeks: null, // верхняя граница неизвестна
    isEnabled: true,
    heightAffected: true,
  },
  box_with_light: {
    serviceCode: 'box_with_light',
    title: 'Короб с подсветкой',
    category: 'gkl',
    unit: 'LINEAR_M',
    minPriceKopeks: 77000,
    maxPriceKopeks: 104500,
    isEnabled: true,
    heightAffected: false,
    isCompositeLight: true,
  },
  putty_wallpaper: {
    serviceCode: 'putty_wallpaper',
    title: 'Шпаклёвка под обои',
    category: 'painting',
    unit: 'M2',
    minPriceKopeks: 23100,
    maxPriceKopeks: 23100, // фиксированная ставка
    isEnabled: true,
    heightAffected: false,
  },
  putty_paint: {
    serviceCode: 'putty_paint',
    title: 'Шпаклёвка под покраску',
    category: 'painting',
    unit: 'M2',
    minPriceKopeks: 25300,
    maxPriceKopeks: 38500,
    isEnabled: true,
    heightAffected: false,
  },
  paint_two_coats: {
    serviceCode: 'paint_two_coats',
    title: 'Покраска в 2 слоя',
    category: 'painting',
    unit: 'M2',
    minPriceKopeks: 19800,
    maxPriceKopeks: 33000,
    isEnabled: true,
    heightAffected: false,
  },
};

export const SEED_PRICE_LIST_SPB: PriceListSnapshot = {
  versionId: 'seed-spb-v1',
  algorithmVersion: '1.0.0',
  city: 'spb',
  services: SPB_SERVICES,
  heightModifiers: COMMON_HEIGHT_MODIFIERS,
  doorOpening: COMMON_DOOR_OPENING,
  smallVolumeModifier: COMMON_SMALL_VOLUME,
  options: COMMON_OPTIONS,
};

export const SEED_PRICE_LIST_NN: PriceListSnapshot = {
  versionId: 'seed-nn-v1',
  algorithmVersion: '1.0.0',
  city: 'nn',
  services: NN_SERVICES,
  heightModifiers: COMMON_HEIGHT_MODIFIERS,
  doorOpening: COMMON_DOOR_OPENING,
  smallVolumeModifier: COMMON_SMALL_VOLUME,
  options: COMMON_OPTIONS,
};

export function getSeedPriceList(city: City): PriceListSnapshot {
  return city === 'spb' ? SEED_PRICE_LIST_SPB : SEED_PRICE_LIST_NN;
}
