import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  HeroSection,
  ServicesSection,
  WorkflowSection,
  NormsSection,
  FAQSection,
} from '@/components/LandingSections';
import { CalculatorWidget } from '@/components/CalculatorWidget';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import type { City } from '@/domain/calculator/types';

interface PageProps {
  params: Promise<{ city: string }>;
}

export function generateStaticParams() {
  return [{ city: 'spb' }, { city: 'nn' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;

  if (city !== 'spb' && city !== 'nn') {
    return { title: 'Страница не найдена — Савин Групп' };
  }

  const isSpb = city === 'spb';
  const cityName = isSpb ? 'Санкт-Петербурге' : 'Нижнем Новгороде';
  const shortCity = isSpb ? 'СПб' : 'Нижнем Новгороде';

  return {
    title: `Гипсокартонные и малярные работы в ${shortCity} — Савин Групп`,
    description: `Монтаж перегородок из ГКЛ, потолков, обшивка стен и безвоздушная покраска в ${cityName}. Онлайн калькулятор сметы, соблюдение СП 163.1325800 и ГОСТ.`,
  };
}

export default async function CityLandingPage({ params }: PageProps) {
  const { city } = await params;

  if (city !== 'spb' && city !== 'nn') {
    notFound();
  }

  const cityCode = city as City;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F1]">
      <Header currentCity={cityCode} />

      <main className="flex-1">
        <HeroSection city={cityCode} />

        <ServicesSection city={cityCode} />

        {/* Embedded Interactive Calculator */}
        <section className="py-20 bg-white border-t border-[#E5E3DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CalculatorWidget initialCity={cityCode} />
          </div>
        </section>

        {/* Quality and Raking Light Inspection */}
        <section id="cases" className="py-20 bg-[#F6F5F1] border-t border-[#E5E3DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#194B46] block mb-2">
                Контроль качества
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F2626]">
                Подготовка под проявочный свет (категория Q4)
              </h2>
              <p className="mt-2 text-sm text-[#646E6E]">
                Мы сдаем малярные работы с проверкой косым светом специальных ламп, гарантируя
                отсутствие стыков, полос и теней на финишном покрытии.
              </p>
            </div>

            <BeforeAfterSlider />
          </div>
        </section>

        <WorkflowSection />

        <NormsSection />

        <FAQSection />
      </main>

      <Footer currentCity={cityCode} />
    </div>
  );
}
