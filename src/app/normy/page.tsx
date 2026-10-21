import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NormsSection } from '@/components/LandingSections';

export const metadata: Metadata = {
  title: 'Строительные нормы и стандарты СП / ГОСТ — Савин Групп',
  description:
    'Действующие строительные нормативы (СП 163.1325800, ГОСТ 6266-97, СП 71.13330, ГОСТ Р 72509-2026), применяемые при монтаже гипсокартона и малярных работах.',
};

export default function NormyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F1]">
      <Header currentCity="spb" />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h1 className="text-3xl sm:text-5xl font-black text-[#1F2626] tracking-tight">
              Действующие нормативы и технические стандарты
            </h1>
            <p className="mt-4 text-[#646E6E] text-sm sm:text-base leading-relaxed">
              Мы ведем монтажные и отделочные работы в строгом соответствии с государственными
              строительными стандартами РФ. Ниже представлены официальные нормативные документы и их
              требования.
            </p>
          </div>

          <NormsSection />

          <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E3DC] text-xs text-[#646E6E] space-y-4">
            <h3 className="font-bold text-base text-[#1F2626]">
              Порядок контроля качества на объектах:
            </h3>
            <p className="leading-relaxed">
              1. <b>Проверка геометрии каркаса:</b> монтаж стоечных профилей с шагом 400 или 600 мм,
              использование вибродемпферных лент по периметру примыкания к несущим конструкциям (СП
              163.1325800.2014).
            </p>
            <p className="leading-relaxed">
              2. <b>Шаг саморезов:</b> фиксация листов ГКЛ с шагом не более 250 мм, заглубление
              шляпки на 1 мм без прорыва картона.
            </p>
            <p className="leading-relaxed">
              3. <b>Контроль плоскости:</b> проверка 2-метровым контрольным алюминиевым правилом во
              всех направлениях. Максимальный допустимый просвет при высококачественной отделке по
              ГОСТ Р 72509-2026 не превышает 1.5–2 мм.
            </p>
          </div>
        </div>
      </main>

      <Footer currentCity="spb" />
    </div>
  );
}
