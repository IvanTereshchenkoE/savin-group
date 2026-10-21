import { eq, and } from 'drizzle-orm';
import { db } from '../db/client';
import { priceListVersions, priceListItems } from '../db/schema';
import { getSeedPriceList } from '@/domain/calculator/seed';
import type { City, PriceListSnapshot, PriceListItem } from '@/domain/calculator/types';

/**
 * Resolves the currently published price list snapshot for the given city.
 * Falls back to the verified seed price list if database connection fails or no version is published yet.
 */
export async function getPublishedPriceList(city: City): Promise<PriceListSnapshot> {
  const seed = getSeedPriceList(city);

  try {
    const publishedVersions = await db
      .select()
      .from(priceListVersions)
      .where(and(eq(priceListVersions.city, city), eq(priceListVersions.status, 'PUBLISHED')))
      .limit(1);

    const versionRecord = publishedVersions[0];
    if (!versionRecord) {
      return seed;
    }

    const items = await db
      .select()
      .from(priceListItems)
      .where(eq(priceListItems.versionId, versionRecord.id));

    if (items.length === 0) {
      return seed;
    }

    const servicesMap: Record<string, PriceListItem> = {};

    for (const item of items) {
      const seedItem = seed.services[item.serviceCode];
      servicesMap[item.serviceCode] = {
        serviceCode: item.serviceCode,
        title: seedItem?.title || item.serviceCode,
        category: seedItem?.category || 'gkl',
        unit: seedItem?.unit || 'M2',
        minPriceKopeks: item.minPriceKopeks,
        maxPriceKopeks: item.maxPriceKopeks,
        isEnabled: item.isEnabled,
        heightAffected: seedItem?.heightAffected ?? false,
        isPartition: seedItem?.isPartition ?? false,
        isCompositeAcoustic: seedItem?.isCompositeAcoustic ?? false,
        isCompositeLight: seedItem?.isCompositeLight ?? false,
      };
    }

    return {
      versionId: versionRecord.id,
      algorithmVersion: versionRecord.algorithmVersion,
      city,
      services: servicesMap,
      heightModifiers: seed.heightModifiers,
      doorOpening: seed.doorOpening,
      smallVolumeModifier: seed.smallVolumeModifier,
      options: seed.options,
    };
  } catch (err) {
    console.warn(
      `[PricingRepository] Could not read price list from DB for ${city}, falling back to seed.`,
      err,
    );
    return seed;
  }
}
