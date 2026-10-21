import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CalculatorWidget } from '@/components/CalculatorWidget';
import type { City } from '@/domain/calculator/types';

export const metadata: Metadata = {
  title: 'Онлайн-калькулятор стоимости ГКЛ и малярных работ — Савин Групп',
  description:
    'Интерактивный расчет предварительной сметы на перегородки, потолки, обшивку стен из ГКЛ и покраску в Санкт-Петербурге и Нижнем Новгороде.',
};

interface CalculatorPageProps {
  searchParams: Promise<{ city?: string }>;
}

async function CalculatorContent({ searchParams }: CalculatorPageProps) {
  const { city } = await searchParams;
  const validCity: City = city === 'nn' ? 'nn' : 'spb';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F1]">
      <Header currentCity={validCity} />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CalculatorWidget initialCity={validCity} />

          <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E3DC] text-xs text-[#646E6E] space-y-3">
            <h3 className="font-bold text-sm text-[#1F2626]">Правила и прозрачность расчета:</h3>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>
                Расчет строится на базе утвержденной сетки ставок для Санкт-Петербурга и Нижнего
                Новгорода.
              </li>
              <li>
                Указанные диапазоны включают стоимость выполнения работ монтажной бригадой.
                Стоимость материалов, крепежа и доставки рассчитывается индивидуально в зависимости
                от выбранного производителя листов (Knauf, Danogips, Волма).
              </li>
              <li>
                Коэффициенты высоты потолка применяются исключительно к конструкциям, требующим
                монтажа со строительных лесов (потолки, короба и перегородки свыше 3 метров).
              </li>
              <li>
                Онлайн-расчет не является офертой и носит предварительный характер. Окончательная
                смета фиксируется в договоре после бесплатного замера.
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer currentCity={validCity} />
    </div>
  );
}

export default function CalculatorPage(props: CalculatorPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-[#646E6E]">Загрузка калькулятора...</div>
      }
    >
      <CalculatorContent {...props} />
    </Suspense>
  );
}
