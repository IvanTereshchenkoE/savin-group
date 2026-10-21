import React from 'react';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { leads, leadCalculationSnapshots, notificationOutbox } from '@/server/db/schema';
import { LeadsTableClient } from './LeadsTableClient';

export default async function AdminLeadsPage() {
  let allLeads: Array<{
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
  }> = [];

  try {
    const records = await db
      .select({
        lead: leads,
        outbox: notificationOutbox,
        snapshot: leadCalculationSnapshots,
      })
      .from(leads)
      .leftJoin(notificationOutbox, eq(leads.id, notificationOutbox.leadId))
      .leftJoin(leadCalculationSnapshots, eq(leads.id, leadCalculationSnapshots.leadId))
      .orderBy(desc(leads.createdAt))
      .limit(50);

    allLeads = records.map((r) => ({
      id: r.lead.id,
      publicNumber: r.lead.publicNumber,
      city: r.lead.city,
      type: r.lead.type,
      name: r.lead.name,
      phoneE164: r.lead.phoneE164,
      comment: r.lead.comment,
      status: r.lead.status,
      createdAt: r.lead.createdAt,
      outboxStatus: r.outbox?.status ?? null,
      snapshotMinRubles: r.snapshot ? Math.floor(r.snapshot.totalMinKopeks / 100) : null,
      snapshotMaxRubles:
        r.snapshot && r.snapshot.totalMaxKopeks !== null
          ? Math.ceil(r.snapshot.totalMaxKopeks / 100)
          : null,
    }));
  } catch (err) {
    console.warn('[AdminLeadsPage] Query note:', err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1F2626]">Заявки клиентов</h1>
        <p className="text-xs sm:text-sm text-[#646E6E] mt-1">
          Все обращения с сайта с сохраненными неизменяемыми снимками смет и статусом отправки в
          Telegram
        </p>
      </div>

      <LeadsTableClient initialLeads={allLeads} />
    </div>
  );
}
