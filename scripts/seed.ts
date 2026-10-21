import { db } from '../src/server/db/client';
import {
  users,
  citySettings,
  services,
  priceListVersions,
  priceListItems,
} from '../src/server/db/schema';
import { hashPassword } from '../src/server/auth/password';
import { SEED_PRICE_LIST_SPB, SEED_PRICE_LIST_NN } from '../src/domain/calculator/seed';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting Savin Group Database Seeding...');

  // 1. Initial Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@savin-group.ru';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Savin2026!Master';

  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

  if (existingAdmin.length === 0) {
    const passwordHash = await hashPassword(adminPassword);
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      role: 'OWNER',
    });
    console.log(`✅ Created owner user: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Owner user already exists: ${adminEmail}`);
  }

  // 2. City Settings
  const cities = [
    {
      cityCode: 'spb',
      cityName: 'Санкт-Петербург',
      phone: '+7 (812) 000-00-00',
      telegramUrl: 'https://t.me/savingroup_spb',
      maxUrl: 'https://max.ru/savingroup_spb',
      heroTitle: 'Монтаж ГКЛ, шпаклёвка и покраска в Санкт-Петербурге',
      heroText:
        'Профессиональные перегородки, короба, потолки и малярные работы с гарантией качества и соблюдением СП/ГОСТ.',
      seoTitle: 'Савин Групп — Гипсокартонные и малярные работы в СПб',
      seoDescription:
        'Качественный монтаж гипсокартона, шпаклёвка и безвоздушная покраска в Санкт-Петербурге. Точный калькулятор стоимости.',
      active: true,
    },
    {
      cityCode: 'nn',
      cityName: 'Нижний Новгород',
      phone: '+7 (831) 000-00-00',
      telegramUrl: 'https://t.me/savingroup_nn',
      maxUrl: 'https://max.ru/savingroup_nn',
      heroTitle: 'Монтаж ГКЛ, шпаклёвка и покраска в Нижнем Новгороде',
      heroText:
        'Надёжные перегородки, потолочные системы и финишная отделка поверхностей по проверенным стандартам.',
      seoTitle: 'Савин Групп — Гипсокартонные и малярные работы в Нижнем Новгороде',
      seoDescription:
        'Монтаж перегородок из ГКЛ, потолков и покраска стен в Нижнем Новгороде. Расчёт предварительной сметы онлайн.',
      active: true,
    },
  ];

  for (const c of cities) {
    await db.insert(citySettings).values(c).onConflictDoUpdate({
      target: citySettings.cityCode,
      set: c,
    });
  }
  console.log('✅ Seeded city settings (spb, nn)');

  // 3. Services Catalog
  for (const item of Object.values(SEED_PRICE_LIST_SPB.services)) {
    const existing = await db
      .select()
      .from(services)
      .where(eq(services.code, item.serviceCode))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(services).values({
        code: item.serviceCode,
        title: item.title,
        category: item.category,
        unit: item.unit,
        heightAffected: item.heightAffected,
        isComposite: item.isCompositeAcoustic || item.isCompositeLight || false,
      });
    }
  }
  console.log('✅ Seeded services catalog');

  // 4. Price Lists for SPB & NN
  const priceListsToSeed = [SEED_PRICE_LIST_SPB, SEED_PRICE_LIST_NN];

  for (const pList of priceListsToSeed) {
    const existingVersion = await db
      .select()
      .from(priceListVersions)
      .where(eq(priceListVersions.id, pList.versionId))
      .limit(1);

    if (existingVersion.length === 0) {
      await db.insert(priceListVersions).values({
        id: pList.versionId,
        city: pList.city,
        versionNumber: 1,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        algorithmVersion: pList.algorithmVersion,
      });

      for (const item of Object.values(pList.services)) {
        await db.insert(priceListItems).values({
          versionId: pList.versionId,
          serviceCode: item.serviceCode,
          minPriceKopeks: item.minPriceKopeks,
          maxPriceKopeks: item.maxPriceKopeks,
          isEnabled: item.isEnabled,
        });
      }
      console.log(`✅ Seeded published price list: ${pList.city} (${pList.versionId})`);
    }
  }

  console.log('🎉 Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
