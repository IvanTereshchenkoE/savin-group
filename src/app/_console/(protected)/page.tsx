import React from 'react';
import Link from 'next/link';
import { desc, count, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { leads, notificationOutbox } from '@/server/db/schema';
import { Users, AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export default async function AdminDashboardPage() {
  let totalLeadsCount = 0;
  let newLeadsCount = 0;
  let pendingNotifications = 0;
  let recentLeads: Array<typeof leads.$inferSelect> = [];

  try {
    const totalRes = await db.select({ val: count() }).from(leads);
    totalLeadsCount = totalRes[0]?.val ?? 0;

    const newRes = await db.select({ val: count() }).from(leads).where(eq(leads.status, 'NEW'));
    newLeadsCount = newRes[0]?.val ?? 0;

    const pendingRes = await db
      .select({ val: count() })
      .from(notificationOutbox)
      .where(eq(notificationOutbox.status, 'FAILED_RETRYABLE'));
    pendingNotifications = pendingRes[0]?.val ?? 0;

    recentLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(6);
  } catch (err) {
    console.warn('[AdminDashboard] Database stats query notice:', err);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1F2626]">Обзор системы и заявок</h1>
        <p className="text-xs sm:text-sm text-[#646E6E] mt-1">
          Оперативная статистика обращений клиентов и состояния очереди уведомлений в Telegram
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E3DC] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#646E6E] uppercase tracking-wider">
              Всего обращений
            </span>
            <Users className="w-5 h-5 text-[#194B46]" />
          </div>
          <span className="text-3xl font-black text-[#1F2626] block">{totalLeadsCount}</span>
          <span className="text-xs text-[#808C8C] mt-1 block">За все время</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E3DC] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#646E6E] uppercase tracking-wider">
              Новые заявки
            </span>
            <Clock className="w-5 h-5 text-[#C86F50]" />
          </div>
          <span className="text-3xl font-black text-[#C86F50] block">{newLeadsCount}</span>
          <span className="text-xs text-[#808C8C] mt-1 block">Требуют звонка клиенту</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E3DC] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#646E6E] uppercase tracking-wider">
              Ошибки Telegram
            </span>
            {pendingNotifications > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#194B46]" />
            )}
          </div>
          <span className="text-3xl font-black text-[#1F2626] block">{pendingNotifications}</span>
          <span className="text-xs text-[#808C8C] mt-1 block">
            {pendingNotifications > 0 ? 'Ожидают повтора' : 'Очередь чиста'}
          </span>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#E5E3DC] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1F2626]">Последние поступившие заявки</h2>
          <Link
            href="/_console/leads"
            className="text-xs font-bold text-[#194B46] hover:underline flex items-center gap-1"
          >
            Все заявки <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#808C8C]">
            Заявок пока нет. Новые заявки с калькулятора и форм связи будут отображаться здесь.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E3DC]">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F6F5F1] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#1F2626]">
                      {lead.publicNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#E5E3DC] text-[#646E6E]">
                      {lead.city.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#194B46]/10 text-[#194B46]">
                      {lead.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#646E6E]">
                    {lead.name ? `${lead.name} • ` : ''}
                    <span className="font-semibold text-[#1F2626]">{lead.phoneE164}</span>
                    {lead.comment ? ` • "${lead.comment}"` : ''}
                  </div>
                </div>

                <div className="text-xs text-[#808C8C] whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
