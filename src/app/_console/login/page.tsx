'use client';

import React, { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { loginAdminAction } from '@/server/actions/admin';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginAdminAction(formData);
      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      // Note: Next.js redirect throws a NEXT_REDIRECT error internally on success
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F5F1] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#E5E3DC] shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#194B46]/10 text-[#194B46] rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#1F2626]">Вход в панель управления</h1>
          <p className="text-xs text-[#646E6E] mt-1">САВИН ГРУПП &bull; Администрирование</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1F2626] uppercase tracking-wider mb-1.5">
              Email администратора
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#808C8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                defaultValue="admin@savin-group.ru"
                placeholder="admin@savin-group.ru"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C5C3BC] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#194B46]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2626] uppercase tracking-wider mb-1.5">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#808C8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C5C3BC] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#194B46]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#194B46] hover:bg-[#143D39] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Проверка доступа...
              </>
            ) : (
              'Войти'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
