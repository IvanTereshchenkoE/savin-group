'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Calculator, Menu, X, MapPin } from 'lucide-react';
import type { City } from '@/domain/calculator/types';

interface HeaderProps {
  currentCity?: City;
}

export function Header({ currentCity = 'spb' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phoneDisplay = currentCity === 'spb' ? '+7 (812) 209-15-40' : '+7 (831) 280-92-30';
  const phoneHref = currentCity === 'spb' ? 'tel:+78122091540' : 'tel:+78312809230';

  const otherCity = currentCity === 'spb' ? 'nn' : 'spb';
  const otherCityLabel = currentCity === 'spb' ? 'Нижний Новгород' : 'Санкт-Петербург';

  return (
    <header className="sticky top-0 z-40 bg-[#F6F5F1]/95 backdrop-blur-md border-b border-[#E5E3DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href={`/${currentCity}`} className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1F2626]">
                САВИН <span className="text-[#194B46]">ГРУПП</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#646E6E] font-medium">
                ГКЛ конструкции &bull; Шпаклёвка &bull; Покраска
              </span>
            </Link>

            {/* City Switcher Pill */}
            <div className="hidden sm:flex items-center ml-4 pl-4 border-l border-[#E5E3DC]">
              <div className="flex items-center bg-white rounded-full p-1 border border-[#E5E3DC] shadow-xs text-xs font-medium">
                <Link
                  href="/spb"
                  className={`px-3 py-1 rounded-full transition-all ${
                    currentCity === 'spb'
                      ? 'bg-[#194B46] text-white shadow-xs font-semibold'
                      : 'text-[#646E6E] hover:text-[#1F2626]'
                  }`}
                >
                  СПб
                </Link>
                <Link
                  href="/nn"
                  className={`px-3 py-1 rounded-full transition-all ${
                    currentCity === 'nn'
                      ? 'bg-[#194B46] text-white shadow-xs font-semibold'
                      : 'text-[#646E6E] hover:text-[#1F2626]'
                  }`}
                >
                  Нижний Новгород
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-[#1F2626]">
            <Link
              href={`/${currentCity}#services`}
              className="hover:text-[#194B46] transition-colors"
            >
              Услуги
            </Link>
            <Link
              href={`/calculator?city=${currentCity}`}
              className="hover:text-[#194B46] transition-colors flex items-center gap-1.5"
            >
              <Calculator className="w-4 h-4 text-[#C86F50]" />
              Калькулятор
            </Link>
            <Link href={`/${currentCity}#cases`} className="hover:text-[#194B46] transition-colors">
              Примеры работ
            </Link>
            <Link href="/normy" className="hover:text-[#194B46] transition-colors">
              СП и ГОСТ
            </Link>
            <Link
              href={`/${currentCity}#contacts`}
              className="hover:text-[#194B46] transition-colors"
            >
              Контакты
            </Link>
          </nav>

          {/* Contact & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href={phoneHref}
              className="flex items-center gap-2 text-sm font-bold text-[#1F2626] hover:text-[#194B46]"
            >
              <Phone className="w-4 h-4 text-[#194B46]" />
              <span>{phoneDisplay}</span>
            </a>

            <Link
              href={`/calculator?city=${currentCity}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#C86F50] hover:bg-[#B45E41] shadow-xs"
            >
              Рассчитать смету
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <a
              href={phoneHref}
              className="p-2 text-[#194B46] bg-white rounded-lg border border-[#E5E3DC]"
              aria-label="Позвонить"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1F2626] bg-white rounded-lg border border-[#E5E3DC]"
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E3DC] bg-[#F6F5F1] px-4 pt-3 pb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DC]">
            <span className="text-xs font-semibold text-[#646E6E] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#194B46]" />
              Текущий город:
            </span>
            <Link
              href={`/${otherCity}`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-[#194B46] underline"
            >
              Сменить на {otherCityLabel}
            </Link>
          </div>

          <div className="flex flex-col space-y-3 text-base font-medium text-[#1F2626]">
            <Link href={`/${currentCity}#services`} onClick={() => setMobileMenuOpen(false)}>
              Услуги
            </Link>
            <Link
              href={`/calculator?city=${currentCity}`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-[#C86F50] font-semibold"
            >
              <Calculator className="w-4 h-4" />
              Онлайн-калькулятор
            </Link>
            <Link href={`/${currentCity}#cases`} onClick={() => setMobileMenuOpen(false)}>
              Примеры работ
            </Link>
            <Link href="/normy" onClick={() => setMobileMenuOpen(false)}>
              Строительные нормативы (СП/ГОСТ)
            </Link>
            <Link href={`/${currentCity}#contacts`} onClick={() => setMobileMenuOpen(false)}>
              Контакты
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href={`/calculator?city=${currentCity}`}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-3 rounded-lg text-sm font-bold text-white bg-[#C86F50]"
            >
              Рассчитать стоимость онлайн
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
