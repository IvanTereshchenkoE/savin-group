'use client';

import React, { useState } from 'react';
import type { PriceListSnapshot, City } from '@/domain/calculator/types';
import { publishPriceVersionAction } from '@/server/actions/admin';
import { Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PricesEditorProps {
  spbInitial: PriceListSnapshot;
  nnInitial: PriceListSnapshot;
}

export function PricesEditorClient({ spbInitial, nnInitial }: PricesEditorProps) {
  const [activeCity, setActiveCity] = useState<City>('spb');
  const spbList = spbInitial;
  const nnList = nnInitial;

  const currentList = activeCity === 'spb' ? spbList : nnList;

  // Local editable rates (in rubles for user convenience, converted to kopeks on submit)
  const [itemsState, setItemsState] = useState<
    Record<string, { minRub: number; maxRub: number | null }>
  >(() => {
    const init: Record<string, { minRub: number; maxRub: number | null }> = {};
    for (const [code, s] of Object.entries(currentList.services)) {
      init[code] = {
        minRub: Math.floor(s.minPriceKopeks / 100),
        maxRub: s.maxPriceKopeks !== null ? Math.ceil(s.maxPriceKopeks / 100) : null,
      };
    }
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const handleCitySwitch = (newCity: City) => {
    setActiveCity(newCity);
    setFeedback(null);
    const target = newCity === 'spb' ? spbList : nnList;
    const nextState: Record<string, { minRub: number; maxRub: number | null }> = {};
    for (const [code, s] of Object.entries(target.services)) {
      nextState[code] = {
        minRub: Math.floor(s.minPriceKopeks / 100),
        maxRub: s.maxPriceKopeks !== null ? Math.ceil(s.maxPriceKopeks / 100) : null,
      };
    }
    setItemsState(nextState);
  };

  const handlePriceChange = (code: string, field: 'minRub' | 'maxRub', val: string) => {
    const num = val === '' ? (field === 'maxRub' ? null : 0) : parseInt(val, 10);
    setItemsState((prev) => ({
      ...prev,
      [code]: {
        ...prev[code]!,
        [field]: num,
      },
    }));
  };

  const handlePublish = async () => {
    setSaving(true);
    setFeedback(null);

    const payload = Object.entries(itemsState).map(([serviceCode, val]) => ({
      serviceCode,
      minPriceKopeks: val.minRub * 100,
      maxPriceKopeks: val.maxRub !== null ? val.maxRub * 100 : null,
    }));

    try {
      const res = await publishPriceVersionAction(activeCity, payload);
      setFeedback({
        type: 'success',
        message: `Новая версия прайса (v${res.versionNumber}) успешно опубликована для города ${activeCity.toUpperCase()}!`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E3DC] shadow-xs p-6 sm:p-8 space-y-6">
      {/* City Switcher */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E5E3DC]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCitySwitch('spb')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCity === 'spb'
                ? 'bg-[#194B46] text-white shadow-xs'
                : 'bg-[#F6F5F1] text-[#646E6E] hover:text-[#1F2626]'
            }`}
          >
            Санкт-Петербург ({spbList.versionId})
          </button>
          <button
            type="button"
            onClick={() => handleCitySwitch('nn')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCity === 'nn'
                ? 'bg-[#194B46] text-white shadow-xs'
                : 'bg-[#F6F5F1] text-[#646E6E] hover:text-[#1F2626]'
            }`}
          >
            Нижний Новгород ({nnList.versionId})
          </button>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handlePublish}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C86F50] hover:bg-[#B45E41] disabled:opacity-50 transition-all shadow-xs"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Публикация...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Опубликовать новую версию
            </>
          )}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Services Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F6F5F1] border-b border-[#E5E3DC] text-[#646E6E] uppercase font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4">Услуга</th>
              <th className="py-3 px-4">Категория</th>
              <th className="py-3 px-4">Единица</th>
              <th className="py-3 px-4">Ставка от (₽)</th>
              <th className="py-3 px-4">Ставка до (₽)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DC]">
            {Object.values(currentList.services).map((srv) => {
              const state = itemsState[srv.serviceCode] || { minRub: 0, maxRub: null };
              return (
                <tr key={srv.serviceCode} className="hover:bg-[#F6F5F1]/50">
                  <td className="py-3 px-4 font-semibold text-[#1F2626]">
                    {srv.title}
                    <span className="block text-[10px] text-[#808C8C] font-mono">
                      {srv.serviceCode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#E5E3DC] text-[#646E6E]">
                      {srv.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#646E6E]">{srv.unit}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      value={state.minRub}
                      onChange={(e) => handlePriceChange(srv.serviceCode, 'minRub', e.target.value)}
                      className="w-24 px-2 py-1.5 rounded-lg border border-[#C5C3BC] font-bold text-right"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      placeholder="без верха"
                      value={state.maxRub !== null ? state.maxRub : ''}
                      onChange={(e) => handlePriceChange(srv.serviceCode, 'maxRub', e.target.value)}
                      className="w-24 px-2 py-1.5 rounded-lg border border-[#C5C3BC] font-bold text-right placeholder-[#A0ACAC]"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
