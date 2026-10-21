import React from 'react';
import { getPublishedPriceList } from '@/server/repositories/pricing';
import { PricesEditorClient } from './PricesEditorClient';

export default async function AdminPricesPage() {
  const spbPriceList = await getPublishedPriceList('spb');
  const nnPriceList = await getPublishedPriceList('nn');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1F2626]">Тарифы и прайс-листы</h1>
        <p className="text-xs sm:text-sm text-[#646E6E] mt-1">
          Управление расценками для Санкт-Петербурга и Нижнего Новгорода. Публикация создает новую
          защищенную версию прайса и не меняет историю уже сохраненных заявок.
        </p>
      </div>

      <PricesEditorClient spbInitial={spbPriceList} nnInitial={nnPriceList} />
    </div>
  );
}
