import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';

export function SettingsPage() {
  const [publicBotUsername, setPublicBotUsername] = useState('');
  const [publicAppUrl, setPublicAppUrl] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSettings();
      setPublicBotUsername(data.publicBotUsername ?? '');
      setPublicAppUrl(data.publicAppUrl ?? '');
      setTelegramBotToken(data.telegramBotToken ?? '');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        publicBotUsername: publicBotUsername.trim(),
        publicAppUrl: publicAppUrl.trim(),
        telegramBotToken: telegramBotToken.trim(),
      });
      alert('Настройки сохранены');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Настройки</h2>
        <button className="rounded border px-3 py-2" onClick={() => void load()} disabled={loading}>
          Обновить
        </button>
      </div>

      {error ? <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <form onSubmit={onSave} className="max-w-2xl space-y-3 rounded border bg-white p-4">
        <label className="block text-sm">
          <div className="mb-1 text-slate-700">Username Telegram-бота (без @)</div>
          <input
            className="w-full rounded border px-3 py-2"
            value={publicBotUsername}
            onChange={(e) => setPublicBotUsername(e.target.value)}
            placeholder="Avtoservice_l_bot"
          />
        </label>
        <label className="block text-sm">
          <div className="mb-1 text-slate-700">Публичный URL приложения</div>
          <input
            className="w-full rounded border px-3 py-2"
            value={publicAppUrl}
            onChange={(e) => setPublicAppUrl(e.target.value)}
            placeholder="https://lr-service-181.ru"
          />
        </label>
        <label className="block text-sm">
          <div className="mb-1 text-slate-700">Токен Telegram-бота</div>
          <input
            className="w-full rounded border px-3 py-2"
            value={telegramBotToken}
            onChange={(e) => setTelegramBotToken(e.target.value)}
            placeholder="123456789:AA..."
          />
        </label>
        <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white" disabled={saving}>
          Сохранить
        </button>
      </form>
    </div>
  );
}
