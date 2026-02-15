import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import type { Appointment } from '../api';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDateTimeLocal(value: Date) {
  const iso = new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString();
  return iso.slice(0, 16);
}

export function AppointmentsPage() {
  const today = useMemo(() => new Date(), []);
  const nextWeek = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }, []);

  const [from, setFrom] = useState(toDateInput(today));
  const [to, setTo] = useState(toDateInput(nextWeek));
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [carId, setCarId] = useState('');
  const [startAt, setStartAt] = useState(toDateTimeLocal(today));
  const [endAt, setEndAt] = useState(toDateTimeLocal(nextWeek));
  const [comment, setComment] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listAppointments({ from, to });
      setRows(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await api.createAppointment({
        clientId,
        carId,
        defectId: null,
        startAt,
        endAt,
        comment,
      });
      setIsOpen(false);
      setClientId('');
      setCarId('');
      setComment('');
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Записи</h2>
        <button
          className="rounded bg-slate-900 px-4 py-2 text-white"
          onClick={() => setIsOpen(true)}
        >
          Создать запись
        </button>
      </div>

      <div className="flex gap-3 items-end bg-white border border-slate-200 rounded p-4">
        <label className="text-sm">
          <div className="mb-1 text-slate-600">С</div>
          <input
            className="border rounded px-2 py-1"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-slate-600">По</div>
          <input
            className="border rounded px-2 py-1"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button className="rounded border px-4 py-2" onClick={() => void load()}>
          Применить
        </button>
      </div>

      {error ? <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Клиент</th>
              <th className="px-3 py-2">Авто</th>
              <th className="px-3 py-2">Начало</th>
              <th className="px-3 py-2">Окончание</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={7}>Загрузка...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={7}>Нет записей</td></tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{item.id.slice(0, 8)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.clientId.slice(0, 8)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.carId.slice(0, 8)}</td>
                  <td className="px-3 py-2">{formatDateTime(item.startAt)}</td>
                  <td className="px-3 py-2">{formatDateTime(item.endAt)}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">{item.comment ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-6 flex items-center justify-center">
          <form onSubmit={onCreate} className="w-full max-w-lg rounded bg-white p-5 space-y-3">
            <h3 className="text-lg font-semibold">Создать запись</h3>
            <input className="w-full rounded border px-3 py-2" placeholder="ID клиента" value={clientId} onChange={(e) => setClientId(e.target.value)} required />
            <input className="w-full rounded border px-3 py-2" placeholder="ID автомобиля" value={carId} onChange={(e) => setCarId(e.target.value)} required />
            <label className="block text-sm">
              <div className="mb-1 text-slate-600">Начало</div>
              <input className="w-full rounded border px-3 py-2" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
            </label>
            <label className="block text-sm">
              <div className="mb-1 text-slate-600">Окончание</div>
              <input className="w-full rounded border px-3 py-2" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
            </label>
            <input className="w-full rounded border px-3 py-2" placeholder="Комментарий" value={comment} onChange={(e) => setComment(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-2" onClick={() => setIsOpen(false)}>Отмена</button>
              <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white">Сохранить</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
