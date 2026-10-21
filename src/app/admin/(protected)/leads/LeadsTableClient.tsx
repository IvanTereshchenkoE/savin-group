'use client';

import React, { useState } from 'react';
import { updateLeadStatusAction, retryLeadNotificationAction } from '@/server/actions/admin';
import { CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface LeadRow {
  id: string;
  publicNumber: string;
  city: string;
  type: string;
  name: string | null;
  phoneE164: string;
  comment: string | null;
  status: string;
  createdAt: Date;
  outboxStatus: string | null;
  snapshotMinRubles: number | null;
  snapshotMaxRubles: number | null;
}

export function LeadsTableClient({ initialLeads }: { initialLeads: LeadRow[] }) {
  const [leadsList, setLeadsList] = useState(initialLeads);
  const [filterCity, setFilterCity] = useState<string>('ALL');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const filtered = leadsList.filter((l) => {
    if (filterCity !== 'ALL' && l.city !== filterCity) return false;
    return true;
  });

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setLoadingAction(leadId);
    try {
      await updateLeadStatusAction(leadId, newStatus);
      setLeadsList((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    } catch (err) {
      alert('Ошибка изменения статуса: ' + String(err));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRetryTelegram = async (leadId: string) => {
    setLoadingAction(leadId);
    try {
      const res = await retryLeadNotificationAction(leadId);
      if (res.success) {
        setLeadsList((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, outboxStatus: 'SENT' } : l)),
        );
        alert('Уведомление успешно отправлено в Telegram!');
      } else {
        alert('Ошибка отправки: ' + (res.error || 'неизвестно'));
      }
    } catch (err) {
      alert('Сбой: ' + String(err));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* City Filters */}
      <div className="flex items-center gap-2">
        {['ALL', 'spb', 'nn'].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCity(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCity === c
                ? 'bg-[#194B46] text-white shadow-xs'
                : 'bg-white border border-[#E5E3DC] text-[#646E6E] hover:text-[#1F2626]'
            }`}
          >
            {c === 'ALL' ? 'Все города' : c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] shadow-xs overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#808C8C]">
            Заявок по выбранному фильтру не найдено.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F5F1] border-b border-[#E5E3DC] text-[#646E6E] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">№ Заявки</th>
                <th className="py-3 px-4">Город</th>
                <th className="py-3 px-4">Клиент</th>
                <th className="py-3 px-4">Смета</th>
                <th className="py-3 px-4">Telegram</th>
                <th className="py-3 px-4">Статус</th>
                <th className="py-3 px-4">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E3DC]">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[#F6F5F1]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1F2626]">
                    {l.publicNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-[#E5E3DC] text-[#646E6E]">
                      {l.city.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1F2626]">{l.phoneE164}</div>
                    {l.name && <div className="text-[#646E6E]">{l.name}</div>}
                    {l.comment && (
                      <div className="text-[11px] text-[#808C8C] max-w-xs truncate">
                        &quot;{l.comment}&quot;
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {l.snapshotMinRubles !== null ? (
                      <span className="font-bold text-[#194B46]">
                        {l.snapshotMinRubles.toLocaleString('ru-RU')}
                        {l.snapshotMaxRubles !== null
                          ? `–${l.snapshotMaxRubles.toLocaleString('ru-RU')} ₽`
                          : ' ₽ (от)'}
                      </span>
                    ) : (
                      <span className="text-[#808C8C]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          l.outboxStatus === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.outboxStatus === 'FAILED_RETRYABLE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {l.outboxStatus === 'SENT' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {l.outboxStatus || 'Н/Д'}
                      </span>
                      {l.outboxStatus !== 'SENT' && (
                        <button
                          type="button"
                          onClick={() => handleRetryTelegram(l.id)}
                          disabled={loadingAction === l.id}
                          title="Повторить отправку в Telegram"
                          className="p-1 text-[#C86F50] hover:text-[#B45E41] disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={l.status}
                      disabled={loadingAction === l.id}
                      onChange={(e) => handleStatusChange(l.id, e.target.value)}
                      className="text-xs font-semibold px-2 py-1 rounded-lg border border-[#C5C3BC] bg-white focus:outline-hidden"
                    >
                      <option value="NEW">NEW (Новая)</option>
                      <option value="CONTACTED">CONTACTED (Взят контакт)</option>
                      <option value="IN_PROGRESS">IN_PROGRESS (В работе)</option>
                      <option value="CLOSED">CLOSED (Сдана)</option>
                      <option value="REJECTED">REJECTED (Отказ)</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-[#808C8C] whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
