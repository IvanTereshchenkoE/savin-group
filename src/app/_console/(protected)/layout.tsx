import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, Coins, Settings, LogOut, ExternalLink } from 'lucide-react';
import { getCurrentAdmin } from '@/server/auth/session';
import { logoutAdminAction } from '@/server/actions/admin';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/_console/login');
  }

  return (
    <div className="min-h-screen flex bg-[#F6F5F1]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1F2626] text-white flex flex-col justify-between p-6 shrink-0 border-r border-[#313C3C]">
        <div className="space-y-8">
          {/* Brand */}
          <div>
            <span className="text-xl font-black tracking-tight text-white block">
              САВИН <span className="text-[#C86F50]">ГРУПП</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-[#A0ACAC] tracking-wider block mt-0.5">
              Панель управления
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5 text-sm font-medium">
            <Link
              href="/_console"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#273232] text-[#A0ACAC] hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#194B46]" />
              Обзор
            </Link>
            <Link
              href="/_console/leads"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#273232] text-[#A0ACAC] hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 text-[#C86F50]" />
              Заявки клиентов
            </Link>
            <Link
              href="/_console/prices"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#273232] text-[#A0ACAC] hover:text-white transition-colors"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              Тарифы и прайс-листы
            </Link>
            <Link
              href="/_console/settings"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#273232] text-[#A0ACAC] hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-[#808C8C]" />
              Настройки &amp; Бот
            </Link>
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="pt-6 border-t border-[#313C3C] space-y-4">
          <Link
            href="/spb"
            target="_blank"
            className="flex items-center justify-between text-xs text-[#A0ACAC] hover:text-white transition-colors"
          >
            <span>Открыть сайт</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="text-xs">
            <span className="text-[#808C8C] block">Авторизован:</span>
            <span className="font-semibold text-white truncate block">{admin.email}</span>
            <span className="inline-block px-2 py-0.5 mt-1 rounded bg-[#194B46]/40 text-[#194B46] text-[10px] font-bold">
              {admin.role}
            </span>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-red-300 hover:text-white hover:bg-red-950/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Выйти
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
