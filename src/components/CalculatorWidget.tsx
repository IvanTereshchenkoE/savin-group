'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Building2,
  Sparkles,
} from 'lucide-react';
import { calculateEstimate } from '@/domain/calculator/calculate';
import { getSeedPriceList } from '@/domain/calculator/seed';
import type {
  City,
  CeilingHeightBand,
  CalculationResult,
  CalculatorItemInput,
} from '@/domain/calculator/types';

interface CalculatorWidgetProps {
  initialCity?: City;
  className?: string;
}

export function CalculatorWidget({ initialCity = 'spb', className = '' }: CalculatorWidgetProps) {
  const [city, setCity] = useState<City>(initialCity);
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({
    partition_single: true,
    putty_paint: true,
    paint_two_coats: true,
  });
  const [quantities, setQuantities] = useState<Record<string, string>>({
    partition_single: '20',
    putty_paint: '50',
    paint_two_coats: '50',
  });
  const [heightBand, setHeightBand] = useState<CeilingHeightBand>('UP_TO_3');
  const [doorOpenings, setDoorOpenings] = useState<number>(0);

  // Form Submission State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Client idempotency key
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'key-' + Math.random().toString(36).substring(2);
  });

  const priceList = useMemo(() => getSeedPriceList(city), [city]);

  // Check if partition service is chosen
  const hasPartition = Boolean(
    selectedServices['partition_single'] || selectedServices['partition_double_acoustic'],
  );
  const effectiveDoorOpenings = hasPartition ? doorOpenings : 0;

  // Live calculation result
  const calculationResult: CalculationResult | null = useMemo(() => {
    const items: CalculatorItemInput[] = [];

    for (const [code, isSelected] of Object.entries(selectedServices)) {
      if (isSelected && quantities[code]) {
        const qtyNum = parseFloat(quantities[code]);
        if (!isNaN(qtyNum) && qtyNum > 0) {
          items.push({
            serviceCode: code,
            quantity: quantities[code],
          });
        }
      }
    }

    if (items.length === 0) {
      return null;
    }

    try {
      return calculateEstimate(
        {
          city,
          items,
          ceilingHeightBand: heightBand,
          doorOpenings: effectiveDoorOpenings,
        },
        priceList,
      );
    } catch {
      return null;
    }
  }, [city, selectedServices, quantities, heightBand, effectiveDoorOpenings, priceList]);

  const toggleService = (code: string) => {
    setSelectedServices((prev) => {
      const next = !prev[code];
      const updated = { ...prev, [code]: next };
      if (next && !quantities[code]) {
        setQuantities((q) => ({ ...q, [code]: '15' }));
      }
      return updated;
    });
  };

  const handleQuantityChange = (code: string, val: string) => {
    setQuantities((prev) => ({ ...prev, [code]: val }));
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!consent) {
      setSubmitError('Необходимо подтвердить согласие на обработку персональных данных');
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setSubmitError('Пожалуйста, введите корректный номер телефона');
      return;
    }

    setIsSubmitting(true);

    const items: CalculatorItemInput[] = [];
    for (const [code, isSelected] of Object.entries(selectedServices)) {
      if (isSelected && quantities[code]) {
        items.push({
          serviceCode: code,
          quantity: quantities[code],
        });
      }
    }

    const payload = {
      idempotencyKey,
      city,
      type: 'CALCULATOR',
      name: name.trim() || undefined,
      phone: phone.trim(),
      comment: comment.trim() || undefined,
      consent: true,
      priceListVersionId: priceList.versionId,
      calculatorInput: {
        city,
        items,
        ceilingHeightBand: heightBand,
        doorOpenings: hasPartition ? doorOpenings : 0,
      },
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 && data.code === 'PRICE_UPDATED') {
        setSubmitError(
          'Прайс-лист обновился. Мы пересчитали предварительную смету по новым тарифам. Нажмите отправить повторно для подтверждения.',
        );
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        setSubmitError(data.message || 'Ошибка отправки заявки');
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(data.publicNumber);
      // Generate new key for next submission
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        setIdempotencyKey(crypto.randomUUID());
      }
    } catch {
      setSubmitError('Сетевая ошибка при отправке заявки. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const servicesList = Object.values(priceList.services);
  const gklServices = servicesList.filter((s) => s.category === 'gkl');
  const paintingServices = servicesList.filter((s) => s.category === 'painting');

  return (
    <div
      id="calculator"
      className={`bg-white rounded-3xl border border-[#E5E3DC] shadow-xl p-6 sm:p-10 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-[#E5E3DC] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#194B46]/10 text-[#194B46] text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            Интерактивный расчет сметы
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F2626]">
            Калькулятор стоимости работ
          </h2>
          <p className="text-sm text-[#646E6E] mt-1">
            Выберите необходимые услуги и укажите объёмы для расчёта честного диапазона
          </p>
        </div>

        {/* City Toggle */}
        <div className="flex items-center bg-[#F6F5F1] p-1.5 rounded-xl border border-[#E5E3DC]">
          <button
            type="button"
            onClick={() => setCity('spb')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              city === 'spb'
                ? 'bg-[#194B46] text-white shadow-xs'
                : 'text-[#646E6E] hover:text-[#1F2626]'
            }`}
          >
            Санкт-Петербург
          </button>
          <button
            type="button"
            onClick={() => setCity('nn')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              city === 'nn'
                ? 'bg-[#194B46] text-white shadow-xs'
                : 'text-[#646E6E] hover:text-[#1F2626]'
            }`}
          >
            Нижний Новгород
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Services Selection and Volume Inputs */}
        <div className="lg:col-span-7 space-y-8">
          {/* GKL Services Group */}
          <div>
            <h3 className="text-base font-bold text-[#1F2626] mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#194B46]" />
              Конструкции из гипсокартона (ГКЛ)
            </h3>
            <div className="space-y-3">
              {gklServices.map((service) => {
                const isSelected = Boolean(selectedServices[service.serviceCode]);
                const qty = quantities[service.serviceCode] || '15';
                const minRub = Math.floor(service.minPriceKopeks / 100);
                const maxRub =
                  service.maxPriceKopeks !== null ? Math.ceil(service.maxPriceKopeks / 100) : null;

                return (
                  <div
                    key={service.serviceCode}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#F6F5F1] border-[#194B46] shadow-xs'
                        : 'bg-white border-[#E5E3DC] hover:border-[#C5C3BC]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <label className="flex items-start gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(service.serviceCode)}
                          className="mt-1 w-4 h-4 rounded text-[#194B46] focus:ring-[#194B46] border-[#C5C3BC]"
                        />
                        <div>
                          <span className="text-sm font-semibold text-[#1F2626] block">
                            {service.title}
                          </span>
                          <span className="text-xs text-[#646E6E]">
                            от {minRub.toLocaleString('ru-RU')}{' '}
                            {maxRub !== null ? `до ${maxRub.toLocaleString('ru-RU')} ` : ''}
                            ₽/{service.unit === 'M2' ? 'м²' : 'пог. м'}
                          </span>
                        </div>
                      </label>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="10000"
                            step="0.5"
                            value={qty}
                            onChange={(e) =>
                              handleQuantityChange(service.serviceCode, e.target.value)
                            }
                            className="w-20 px-2.5 py-1.5 text-sm font-bold text-right bg-white rounded-lg border border-[#C5C3BC] focus:outline-hidden focus:ring-2 focus:ring-[#194B46]"
                          />
                          <span className="text-xs text-[#646E6E] font-medium w-8">
                            {service.unit === 'M2' ? 'м²' : 'пог. м'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Painting Services Group */}
          <div>
            <h3 className="text-base font-bold text-[#1F2626] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C86F50]" />
              Шпаклёвка и покраска (без штукатурки)
            </h3>
            <div className="space-y-3">
              {paintingServices.map((service) => {
                const isSelected = Boolean(selectedServices[service.serviceCode]);
                const qty = quantities[service.serviceCode] || '50';
                const minRub = Math.floor(service.minPriceKopeks / 100);
                const maxRub =
                  service.maxPriceKopeks !== null ? Math.ceil(service.maxPriceKopeks / 100) : null;

                return (
                  <div
                    key={service.serviceCode}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#F6F5F1] border-[#194B46] shadow-xs'
                        : 'bg-white border-[#E5E3DC] hover:border-[#C5C3BC]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <label className="flex items-start gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(service.serviceCode)}
                          className="mt-1 w-4 h-4 rounded text-[#194B46] focus:ring-[#194B46] border-[#C5C3BC]"
                        />
                        <div>
                          <span className="text-sm font-semibold text-[#1F2626] block">
                            {service.title}
                          </span>
                          <span className="text-xs text-[#646E6E]">
                            от {minRub.toLocaleString('ru-RU')}{' '}
                            {maxRub !== null && maxRub !== minRub
                              ? `до ${maxRub.toLocaleString('ru-RU')} `
                              : ''}
                            ₽/м²
                          </span>
                        </div>
                      </label>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="10000"
                            step="0.5"
                            value={qty}
                            onChange={(e) =>
                              handleQuantityChange(service.serviceCode, e.target.value)
                            }
                            className="w-20 px-2.5 py-1.5 text-sm font-bold text-right bg-white rounded-lg border border-[#C5C3BC] focus:outline-hidden focus:ring-2 focus:ring-[#194B46]"
                          />
                          <span className="text-xs text-[#646E6E] font-medium w-8">м²</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parameters: Ceiling Height & Door Openings */}
          <div className="p-5 rounded-2xl bg-[#F6F5F1] border border-[#E5E3DC] space-y-4">
            <div>
              <label className="text-xs font-bold text-[#1F2626] uppercase tracking-wider block mb-2">
                Высота потолка в помещении
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UP_TO_3', label: 'до 3.0 м', desc: 'коэфф. 1.0' },
                  { id: 'FROM_3_TO_3_5', label: '3.0 – 3.5 м', desc: '+15–20%' },
                  { id: 'ABOVE_3_5', label: 'выше 3.5 м', desc: '+30%' },
                ].map((band) => (
                  <button
                    key={band.id}
                    type="button"
                    onClick={() => setHeightBand(band.id as CeilingHeightBand)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      heightBand === band.id
                        ? 'bg-white border-[#194B46] shadow-xs text-[#194B46] font-bold'
                        : 'bg-transparent border-[#E5E3DC] text-[#646E6E] hover:bg-white'
                    }`}
                  >
                    <span className="text-xs block font-semibold">{band.label}</span>
                    <span className="text-[10px] opacity-75">{band.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {hasPartition && (
              <div className="pt-2 border-t border-[#E5E3DC]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1F2626] uppercase tracking-wider block">
                      Дверные проемы в перегородках
                    </span>
                    <span className="text-[11px] text-[#646E6E]">
                      Усиление профиля и обрамление: +2 750–4 400 ₽/шт
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={doorOpenings <= 0}
                      onClick={() => setDoorOpenings((prev) => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-[#E5E3DC] text-base font-bold disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{doorOpenings}</span>
                    <button
                      type="button"
                      onClick={() => setDoorOpenings((prev) => prev + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-[#E5E3DC] text-base font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Summary & Lead Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-[#1F2626] text-white rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#A0ACAC] font-semibold block">
                Предварительная смета ({city === 'spb' ? 'Санкт-Петербург' : 'Нижний Новгород'})
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {calculationResult
                    ? calculationResult.formattedRubles.worksSubtotal.displayFormatted
                    : '0 ₽'}
                </span>
              </div>
              <p className="text-[11px] text-[#A0ACAC] mt-1.5 leading-relaxed">
                Стоимость работ. Окончательная смета с учетом всех условий формируется после выезда
                на объект и лазерного замера.
              </p>
            </div>

            {/* Line items preview */}
            {calculationResult && calculationResult.lines.length > 0 && (
              <div className="border-t border-[#313C3C] pt-4 space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {calculationResult.lines.map((line) => {
                  const minR = Math.floor(line.linePrice.minKopeks / 100);
                  const maxR =
                    line.linePrice.maxKopeks !== null
                      ? Math.ceil(line.linePrice.maxKopeks / 100)
                      : null;
                  return (
                    <div
                      key={line.serviceCode}
                      className="flex justify-between items-center text-[#A0ACAC]"
                    >
                      <span className="truncate pr-2">
                        {line.title} ({line.quantity} {line.unit})
                      </span>
                      <span className="text-white font-medium whitespace-nowrap">
                        {minR.toLocaleString('ru-RU')}
                        {maxR !== null ? `–${maxR.toLocaleString('ru-RU')}` : ''} ₽
                      </span>
                    </div>
                  );
                })}

                {calculationResult.surcharges.map((s) => (
                  <div key={s.code} className="flex justify-between items-center text-[#A0ACAC]">
                    <span>
                      {s.title} ({s.quantity} шт)
                    </span>
                    <span className="text-white font-medium whitespace-nowrap">
                      {Math.floor(s.price.minKopeks / 100).toLocaleString('ru-RU')}–
                      {Math.ceil((s.price.maxKopeks ?? s.price.minKopeks) / 100).toLocaleString(
                        'ru-RU',
                      )}{' '}
                      ₽
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Order / Lead Form */}
            {submitSuccess ? (
              <div className="p-4 rounded-xl bg-[#194B46] text-white space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-white" />
                <h4 className="font-bold text-base">Заявка успешно принята!</h4>
                <p className="text-xs text-[#E5E3DC]">
                  Номер заявки:{' '}
                  <span className="font-mono font-bold text-white">{submitSuccess}</span>
                </p>
                <p className="text-[11px] text-[#A0ACAC]">
                  Мастер свяжется с вами в течение 15 минут для уточнения адреса и удобного времени
                  замера.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="mt-2 text-xs underline text-[#E5E3DC] hover:text-white"
                >
                  Рассчитать другой объект
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitLead}
                className="space-y-3 pt-2 border-t border-[#313C3C]"
              >
                {submitError && (
                  <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#273232] border border-[#3A4747] text-white placeholder-[#808C8C] text-sm focus:outline-hidden focus:border-[#C86F50]"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Телефон * (+7 999 123-45-67)"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#273232] border border-[#3A4747] text-white placeholder-[#808C8C] text-sm focus:outline-hidden focus:border-[#C86F50]"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Адрес или комментарий к заказу"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#273232] border border-[#3A4747] text-white placeholder-[#808C8C] text-sm focus:outline-hidden focus:border-[#C86F50]"
                  />
                </div>

                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded text-[#C86F50] focus:ring-[#C86F50] border-[#3A4747] bg-[#273232]"
                  />
                  <span className="text-[10px] text-[#A0ACAC] leading-tight">
                    Я согласен с{' '}
                    <Link
                      href="/personal-data-consent"
                      target="_blank"
                      className="underline hover:text-white"
                    >
                      условиями обработки персональных данных
                    </Link>{' '}
                    (152-ФЗ)
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#C86F50] hover:bg-[#B45E41] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Отправка сметы...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Получить расчет и вызвать замерщика
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
