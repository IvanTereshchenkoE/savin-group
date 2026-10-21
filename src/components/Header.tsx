'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Menu, X } from 'lucide-react';
import type { City } from '@/domain/calculator/types';

interface HeaderProps {
  currentCity?: City;
}

const NAV: { href: (city: City) => string; label: string }[] = [
  { href: (city) => `/${city}#services`, label: 'Услуги' },
  { href: (city) => `/calculator?city=${city}`, label: 'Калькулятор' },
  { href: (city) => `/${city}#cases`, label: 'Примеры' },
  { href: () => '/normy', label: 'Нормы' },
  { href: (city) => `/${city}#contacts`, label: 'Контакты' },
];

export function Header({ currentCity = 'spb' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phoneDisplay = currentCity === 'spb' ? '+7 (812) 209-15-40' : '+7 (831) 280-92-30';
  const phoneHref = currentCity === 'spb' ? 'tel:+78122091540' : 'tel:+78312809230';

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[#1F2626] text-white">
        <div className="max-w-7xl mx-auto h-10 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-[11px] tracking-wide">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <CityLink city="spb" currentCity={currentCity} label="СПб" />
            <span className="text-white/25 px-1">/</span>
            <CityLink city="nn" currentCity={currentCity} label="НН" />
          </div>

          <p className="hidden sm:block text-white/45 whitespace-nowrap">
            Гипсокартон · шпаклёвка · покраска
          </p>

          <a
            href={phoneHref}
            className="inline-flex items-center gap-1.5 font-semibold text-white/90 hover:text-white whitespace-nowrap"
          >
            <Phone className="w-3 h-3 text-[#C86F50]" />
            {phoneDisplay}
          </a>
        </div>
      </div>

      <div className="bg-[#F6F5F1]/92 backdrop-blur-md border-b border-[#E5E3DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-[68px]">
            <Link href={`/${currentCity}`} className="flex items-center gap-3 shrink-0">
              <span className="w-9 h-9 rounded-lg bg-[#194B46] text-white text-[11px] font-black tracking-wide flex items-center justify-center">
                СГ
              </span>
              <span className="text-[17px] sm:text-xl font-black tracking-tight text-[#1F2626] whitespace-nowrap leading-none">
                САВИН <span className="text-[#194B46]">ГРУПП</span>
              </span>
            </Link>

            <nav className="hidden lg:flex flex-1 items-center justify-center gap-8 text-[13px] font-medium text-[#1F2626] whitespace-nowrap">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href(currentCity)}
                  className="relative py-1 text-[#3A4343] hover:text-[#194B46] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-[#194B46] after:transition-all hover:after:w-full"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href={`/calculator?city=${currentCity}`}
                className="hidden sm:inline-flex items-center justify-center h-10 px-4 sm:px-5 rounded-full text-[13px] font-semibold text-white bg-[#C86F50] hover:bg-[#B45E41] shadow-[0_1px_2px_rgba(200,111,80,0.35)] whitespace-nowrap"
              >
                Рассчитать смету
              </Link>

              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E3DC] bg-white text-[#1F2626]"
                aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E5E3DC] bg-[#F6F5F1] px-4 sm:px-6 py-5 space-y-5">
          <div className="flex rounded-full bg-white border border-[#E5E3DC] p-1">
            <Link
              href="/spb"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex-1 text-center text-sm font-semibold py-2 rounded-full ${
                currentCity === 'spb' ? 'bg-[#194B46] text-white' : 'text-[#646E6E]'
              }`}
            >
              Санкт-Петербург
            </Link>
            <Link
              href="/nn"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex-1 text-center text-sm font-semibold py-2 rounded-full ${
                currentCity === 'nn' ? 'bg-[#194B46] text-white' : 'text-[#646E6E]'
              }`}
            >
              Нижний Новгород
            </Link>
          </div>

          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href(currentCity)}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 border-b border-[#E5E3DC] text-base font-medium text-[#1F2626]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <a
            href={phoneHref}
            className="flex items-center justify-center gap-2 h-12 rounded-full border border-[#E5E3DC] bg-white text-sm font-semibold text-[#1F2626]"
          >
            <Phone className="w-4 h-4 text-[#194B46]" />
            {phoneDisplay}
          </a>

          <Link
            href={`/calculator?city=${currentCity}`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center h-12 rounded-full text-sm font-semibold text-white bg-[#C86F50]"
          >
            Рассчитать смету
          </Link>
        </div>
      )}
    </header>
  );
}

function CityLink({
  city,
  currentCity,
  label,
}: {
  city: City;
  currentCity: City;
  label: string;
}) {
  const active = city === currentCity;

  return (
    <Link
      href={`/${city}`}
      className={
        active
          ? 'inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-semibold bg-white/10 text-white'
          : 'inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-semibold text-white/45 hover:text-white'
      }
    >
      <span
        className={active ? 'w-1.5 h-1.5 rounded-full bg-[#C86F50]' : 'w-1.5 h-1.5 rounded-full'}
      />
      {label}
    </Link>
  );
}
