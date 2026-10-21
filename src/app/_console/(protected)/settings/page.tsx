'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestTelegram = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/telegram/test', {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Тестовое сообщение успешно доставлено в Telegram (Message ID: ${data.messageId || 'OK'})!`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Ошибка отправки тестового уведомления',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Сетевой сбой: ' + String(err),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1F2626]">
          Настройки системы и каналов связи
        </h1>
        <p className="text-xs sm:text-sm text-[#646E6E] mt-1">
          Конфигурация Telegram-бота, реквизитов и региональных контактов
        </p>
      </div>

      {/* Telegram Bot Card */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1F2626]">Telegram Bot уведомлений</h2>
            <p className="text-xs text-[#646E6E] mt-1 leading-relaxed max-w-xl">
              Бот отправляет уведомления о новых заявках в чат руководителя. Токены и секреты
              загружаются из переменных окружения VPS (
              <code className="bg-[#E5E3DC] px-1 py-0.5 rounded font-mono">TELEGRAM_BOT_TOKEN</code>
              ) и никогда не отображаются в браузере.
            </p>
          </div>

          <button
            type="button"
            disabled={testing}
            onClick={handleTestTelegram}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#194B46] hover:bg-[#143D39] disabled:opacity-50 transition-all shadow-xs shrink-0"
          >
            {testing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Отправка теста...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Проверить Telegram
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* City Contacts Readonly overview */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] shadow-xs p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-[#1F2626]">Региональные контакты</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F6F5F1] space-y-2">
            <span className="font-bold text-[#194B46] block text-sm">Санкт-Петербург</span>
            <div>
              Телефон: <b>+7 (812) 209-15-40</b>
            </div>
            <div>
              Telegram: <b>@savingroup_spb</b>
            </div>
            <div>Режим: 09:00 – 21:00 (МСК)</div>
          </div>

          <div className="p-4 rounded-xl bg-[#F6F5F1] space-y-2">
            <span className="font-bold text-[#C86F50] block text-sm">Нижний Новгород</span>
            <div>
              Телефон: <b>+7 (831) 280-92-30</b>
            </div>
            <div>
              Telegram: <b>@savingroup_nn</b>
            </div>
            <div>Режим: 09:00 – 21:00 (МСК)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
