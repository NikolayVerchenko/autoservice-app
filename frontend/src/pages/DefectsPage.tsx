import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Defect } from '../api';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export function DefectsPage() {
  const [rows, setRows] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listDefects();
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Дефектовки</h2>
        <button className="rounded border px-3 py-2" onClick={() => void load()}>
          Обновить
        </button>
      </div>

      {error ? <div className="rounded bg-red-50 p-3 text-red-700 text-sm">{error}</div> : null}

      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">Номер</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Клиент</th>
              <th className="px-3 py-2">Авто</th>
              <th className="px-3 py-2">Механик</th>
              <th className="px-3 py-2">Сумма</th>
              <th className="px-3 py-2">Создано</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={7}>Загрузка...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={7}>Нет дефектовок</td></tr>
            ) : (
              rows.map((item) => (
                <tr className="border-t" key={item.id}>
                  <td className="px-3 py-2">
                    <Link className="text-blue-700 hover:underline" to={`/defects/${item.id}`}>
                      {item.number}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.clientId}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.carId}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.assignedMechanicId ?? '-'}</td>
                  <td className="px-3 py-2">{item.totals?.totalRub ?? '-'}</td>
                  <td className="px-3 py-2">{formatDateTime(item.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
