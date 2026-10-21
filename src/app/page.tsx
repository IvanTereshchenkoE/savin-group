import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Calculator, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Савин Групп — Гипсокартонные и малярные работы в СПб и Нижнем Новгороде',
  description:
    'Специализированный монтаж перегородок, обшивка стен и потолков из ГКЛ, шпаклёвка и безвоздушная покраска. Точный онлайн-калькулятор стоимости.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F1]">
      <Header currentCity="spb" />

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#194B46]/10 text-[#194B46] text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-[#194B46]" />
            Санкт-Петербург &bull; Нижний Новгород
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#1F2626] tracking-tight leading-[1.1]">
            Монтаж ГКЛ, шпаклёвка и покраска поверхностей
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#646E6E] max-w-2xl mx-auto leading-relaxed">
            Выберите ваш город, чтобы посмотреть актуальные расценки, ознакомиться с примерами работ
            и рассчитать предварительную смету онлайн.
          </p>

          {/* City Selection Cards */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <Link
              href="/spb"
              className="p-8 rounded-2xl bg-white border border-[#E5E3DC] hover:border-[#194B46] shadow-md hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 rounded-xl bg-[#194B46]/10 text-[#194B46] group-hover:bg-[#194B46] group-hover:text-white transition-colors">
                  <MapPin className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold text-[#194B46] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Перейти <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#1F2626]">Санкт-Петербург</h2>
              <p className="text-xs text-[#646E6E] mt-1.5">
                СПб, Мурино, Кудрово, Пушкин, Петергоф и вся Ленинградская область.
              </p>
            </Link>

            <Link
              href="/nn"
              className="p-8 rounded-2xl bg-white border border-[#E5E3DC] hover:border-[#194B46] shadow-md hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 rounded-xl bg-[#C86F50]/10 text-[#C86F50] group-hover:bg-[#C86F50] group-hover:text-white transition-colors">
                  <MapPin className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold text-[#C86F50] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Перейти <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#1F2626]">Нижний Новгород</h2>
              <p className="text-xs text-[#646E6E] mt-1.5">
                Нижний Новгород, Дзержинск, Кстово, Бор и Нижегородская область.
              </p>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-[#646E6E]">
            <Link
              href="/calculator?city=spb"
              className="flex items-center gap-1.5 hover:text-[#194B46] font-semibold"
            >
              <Calculator className="w-4 h-4 text-[#C86F50]" />
              Открыть калькулятор
            </Link>
            <span className="text-[#C5C3BC]">&bull;</span>
            <Link
              href="/normy"
              className="flex items-center gap-1.5 hover:text-[#194B46] font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-[#194B46]" />
              Нормы СП и ГОСТ
            </Link>
          </div>
        </div>
      </main>

      <Footer currentCity="spb" />
    </div>
  );
}
