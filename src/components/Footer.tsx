import React from 'react';
import Link from 'next/link';
import { Send, MessageSquare } from 'lucide-react';
import type { City } from '@/domain/calculator/types';

interface FooterProps {
  currentCity?: City;
}

export function Footer({ currentCity = 'spb' }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const phone = currentCity === 'spb' ? '+7 (812) 209-15-40' : '+7 (831) 280-92-30';
  const phoneHref = currentCity === 'spb' ? 'tel:+78122091540' : 'tel:+78312809230';

  return (
    <footer className="bg-[#1F2626] text-white pt-16 pb-12 border-t border-[#313C3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#313C3C]">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-2xl font-black tracking-tight text-white">
              САВИН <span className="text-[#C86F50]">ГРУПП</span>
            </span>
            <p className="text-sm text-[#A0ACAC] leading-relaxed">
              Специализированный монтаж гипсокартонных систем, профессиональная шпаклёвка и
              безвоздушная покраска по строгим нормам СП 163.1325800 и ГОСТ.
            </p>
            <div className="pt-2 text-xs text-[#808C8C]">
              Регионы: Санкт-Петербург и Ленинградская область, Нижний Новгород и область.
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#E5E3DC] mb-4">
              Разделы сайта
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A0ACAC]">
              <li>
                <Link
                  href={`/${currentCity}#services`}
                  className="hover:text-white transition-colors"
                >
                  Монтаж ГКЛ и малярные работы
                </Link>
              </li>
              <li>
                <Link
                  href={`/calculator?city=${currentCity}`}
                  className="hover:text-white transition-colors"
                >
                  Интерактивный калькулятор
                </Link>
              </li>
              <li>
                <Link href={`/${currentCity}#cases`} className="hover:text-white transition-colors">
                  Реальные объекты и фото
                </Link>
              </li>
              <li>
                <Link href="/normy" className="hover:text-white transition-colors">
                  Действующие нормы СП и ГОСТ
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentCity}#contacts`}
                  className="hover:text-white transition-colors"
                >
                  Контакты и реквизиты
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Compliance */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#E5E3DC] mb-4">
              Правовая информация
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A0ACAC]">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/personal-data-consent" className="hover:text-white transition-colors">
                  Согласие на обработку данных (152-ФЗ)
                </Link>
              </li>
              <li>
                <span className="text-xs text-[#808C8C] block mt-2">
                  Вся информация на сайте и онлайн-расчет носят предварительный характер и не
                  являются публичной офертой (ст. 437 ГК РФ).
                </span>
              </li>
            </ul>
          </div>

          {/* Direct Communication */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#E5E3DC] mb-4">
              Связь с руководителем
            </h4>
            <div className="space-y-3">
              <a
                href={phoneHref}
                className="text-lg font-bold text-white hover:text-[#C86F50] block transition-colors"
              >
                {phone}
              </a>
              <p className="text-xs text-[#A0ACAC]">
                Ежедневно с 09:00 до 21:00 по московскому времени.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://t.me/savingroup_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#273232] hover:bg-[#194B46] text-xs font-semibold text-white transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-[#C86F50]" />
                  Telegram
                </a>
                <a
                  href="https://max.ru/savingroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#273232] hover:bg-[#194B46] text-xs font-semibold text-white transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#C86F50]" />
                  MAX
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#808C8C] gap-4">
          <p>&copy; {currentYear} САВИН ГРУПП. Все права защищены.</p>
          <p>Гипсокартонные и малярные работы в СПб и Нижнем Новгороде.</p>
        </div>
      </div>
    </footer>
  );
}
