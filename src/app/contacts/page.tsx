import React from 'react';
import type { Metadata } from 'next';
import { Phone, Send, MessageSquare, MapPin, Clock } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Контакты бригады в Санкт-Петербурге и Нижнем Новгороде — Савин Групп',
  description:
    'Контактные телефоны, мессенджеры Telegram и MAX бригады «Савин Групп» в СПб и Нижнем Новгороде.',
};

export default function ContactsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F1]">
      <Header currentCity="spb" />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h1 className="text-3xl sm:text-5xl font-black text-[#1F2626] tracking-tight">
              Контакты и связь с мастерами
            </h1>
            <p className="mt-4 text-[#646E6E] text-sm sm:text-base leading-relaxed">
              Отвечаем на звонки и сообщения ежедневно. Выезжаем на замеры в Санкт-Петербурге,
              Ленинградской области, Нижнем Новгороде и Нижегородской области.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SPB */}
            <div className="bg-white rounded-3xl p-8 border border-[#E5E3DC] shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-[#194B46]/10 text-[#194B46]">
                  <MapPin className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-[#1F2626]">Санкт-Петербург</h2>
                  <span className="text-xs text-[#646E6E]">СПб и Ленинградская область</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href="tel:+78122091540"
                  className="flex items-center gap-3 text-lg font-extrabold text-[#1F2626] hover:text-[#194B46] transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#194B46]" />
                  +7 (812) 209-15-40
                </a>

                <div className="flex items-center gap-3 text-xs text-[#646E6E]">
                  <Clock className="w-4 h-4 text-[#808C8C]" />
                  Ежедневно с 09:00 до 21:00 (МСК)
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E3DC] flex gap-3">
                <a
                  href="https://t.me/savingroup_spb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F6F5F1] hover:bg-[#194B46] hover:text-white text-xs font-bold text-[#1F2626] transition-all"
                >
                  <Send className="w-4 h-4 text-[#C86F50]" />
                  Telegram СПб
                </a>
                <a
                  href="https://max.ru/savingroup_spb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F6F5F1] hover:bg-[#194B46] hover:text-white text-xs font-bold text-[#1F2626] transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#C86F50]" />
                  MAX СПб
                </a>
              </div>
            </div>

            {/* NN */}
            <div className="bg-white rounded-3xl p-8 border border-[#E5E3DC] shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-[#C86F50]/10 text-[#C86F50]">
                  <MapPin className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-[#1F2626]">Нижний Новгород</h2>
                  <span className="text-xs text-[#646E6E]">Нижний Новгород и область</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href="tel:+78312809230"
                  className="flex items-center gap-3 text-lg font-extrabold text-[#1F2626] hover:text-[#C86F50] transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#C86F50]" />
                  +7 (831) 280-92-30
                </a>

                <div className="flex items-center gap-3 text-xs text-[#646E6E]">
                  <Clock className="w-4 h-4 text-[#808C8C]" />
                  Ежедневно с 09:00 до 21:00 (МСК)
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E3DC] flex gap-3">
                <a
                  href="https://t.me/savingroup_nn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F6F5F1] hover:bg-[#194B46] hover:text-white text-xs font-bold text-[#1F2626] transition-all"
                >
                  <Send className="w-4 h-4 text-[#C86F50]" />
                  Telegram НН
                </a>
                <a
                  href="https://max.ru/savingroup_nn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F6F5F1] hover:bg-[#194B46] hover:text-white text-xs font-bold text-[#1F2626] transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#C86F50]" />
                  MAX НН
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer currentCity="spb" />
    </div>
  );
}
