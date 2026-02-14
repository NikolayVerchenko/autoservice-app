import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Defect, Mechanic } from '../api';

function badgeClass(value: string) {
  if (value === 'REPLIED' || value === 'ORDER') return 'bg-emerald-100 text-emerald-700';
  if (value === 'RECOMMENDATION') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}

function truncate(text: string, max = 42) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export function DefectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [defect, setDefect] = useState<Defect | null>(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedMechanicId, setSelectedMechanicId] = useState('');

  const [complaintDraft, setComplaintDraft] = useState('');

  const [newLaborName, setNewLaborName] = useState('');
  const [newLaborQty, setNewLaborQty] = useState(1);
  const [newLaborPrice, setNewLaborPrice] = useState(0);

  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartPrice, setNewPartPrice] = useState(0);
  const [newPartFromStock, setNewPartFromStock] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getDefect(id);
      setDefect(data);

      let nextSelectedId = selectedComplaintId;
      if (!nextSelectedId || !data.complaints.find((c) => c.id === nextSelectedId)) {
        nextSelectedId = data.complaints?.[0]?.id ?? null;
        setSelectedComplaintId(nextSelectedId);
      }

      const selected = data.complaints.find((c) => c.id === nextSelectedId) ?? data.complaints?.[0];
      setComplaintDraft(selected?.complaintText ?? '');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMechanics() {
    try {
      const list = await api.listMechanics();
      setMechanics(list);
      setSelectedMechanicId((prev) => prev || list[0]?.id || '');
    } catch (e) {
      alert((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  const selectedComplaint = defect?.complaints.find((c) => c.id === selectedComplaintId) ?? null;

  async function openAssignModal() {
    await loadMechanics();
    setIsAssignOpen(true);
  }

  async function assignMechanic() {
    if (!id || !selectedMechanicId) return;
    try {
      await api.assignMechanic(id, selectedMechanicId);
      setIsAssignOpen(false);
      await load();
      alert('Отправлено механику в Telegram');
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function sendToClient() {
    if (!id) return;
    try {
      await api.sendDefectToClient(id);
      alert('Отправлено клиенту');
    } catch (e) {
      const message = (e as Error).message;
      if (message.includes('Client is not linked to Telegram')) {
        alert('Клиент не привязан к Telegram. Откройте клиента и привяжите.');
        return;
      }

      alert(message);
    }
  }

  async function saveComplaintText() {
    if (!selectedComplaint) return;
    try {
      await api.patchComplaint(selectedComplaint.id, { complaintText: complaintDraft });
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function addLabor(e: FormEvent) {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.addLabor(selectedComplaint.id, {
        name: newLaborName,
        qty: Number(newLaborQty),
        priceRub: Number(newLaborPrice),
      });
      setNewLaborName('');
      setNewLaborQty(1);
      setNewLaborPrice(0);
      await load();
    } catch (e2) {
      alert((e2 as Error).message);
    }
  }

  async function addPart(e: FormEvent) {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.addPart(selectedComplaint.id, {
        name: newPartName,
        qty: Number(newPartQty),
        priceRub: Number(newPartPrice),
        fromStock: newPartFromStock,
      });
      setNewPartName('');
      setNewPartQty(1);
      setNewPartPrice(0);
      setNewPartFromStock(false);
      await load();
    } catch (e2) {
      alert((e2 as Error).message);
    }
  }

  async function removeLabor(laborId: string) {
    try {
      await api.deleteLabor(laborId);
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function removePart(partId: string) {
    try {
      await api.deletePart(partId);
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function setApproval(status: 'PENDING' | 'ORDER' | 'RECOMMENDATION') {
    if (!selectedComplaint) return;
    try {
      await api.patchComplaintApproval(selectedComplaint.id, status);
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function createOrder() {
    if (!id) return;
    try {
      const order = await api.createOrder(id);
      navigate(`/orders/${order.id}`);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between rounded border bg-white p-4">
        <div>
          <h2 className="text-xl font-semibold">{defect?.number ?? 'Дефектовка'}</h2>
          <div className="text-sm text-slate-600 mt-1">
            Status: {defect?.status ?? '-'} | Клиент: {defect?.client?.name ?? defect?.clientId ?? '-'} | Авто:{' '}
            {defect?.car ? `${defect.car.brand} ${defect.car.model}` : defect?.carId ?? '-'}
          </div>
          <div className="text-sm text-slate-600 mt-1">
            Механик: {defect?.assignedMechanicId ?? '-'}
          </div>
          <div className="text-sm mt-2">
            Итого: работы {defect?.totals?.laborTotalRub ?? 0} руб | запчасти {defect?.totals?.partsTotalRub ?? 0} руб | всего {defect?.totals?.totalRub ?? 0} руб
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-2" onClick={() => void load()}>Обновить</button>
          <button className="rounded border px-3 py-2" onClick={() => void openAssignModal()}>
            {defect?.assignedMechanicId ? 'Переназначить механика' : 'Назначить механика'}
          </button>
          <button className="rounded border px-3 py-2" onClick={() => void sendToClient()}>Отправить клиенту</button>
          <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => void createOrder()}>Создать заказ-наряд</button>
        </div>
      </div>

      <div className="flex gap-4">
        <aside className="w-[320px] shrink-0 rounded border bg-white p-3 space-y-2">
          {(defect?.complaints ?? []).map((c) => (
            <button
              key={c.id}
              className={`w-full rounded border p-2 text-left ${selectedComplaintId === c.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}
              onClick={() => {
                setSelectedComplaintId(c.id);
                setComplaintDraft(c.complaintText);
              }}
            >
              <div className="font-medium text-sm">Жалоба {c.idx}</div>
              <div className="text-xs text-slate-600">{truncate(c.complaintText)}</div>
              <div className="mt-2 flex gap-1 flex-wrap">
                <span className={`text-xs rounded px-2 py-0.5 ${badgeClass(c.diagnosticStatus)}`}>{c.diagnosticStatus}</span>
                <span className={`text-xs rounded px-2 py-0.5 ${badgeClass(c.approvalStatus)}`}>{c.approvalStatus}</span>
              </div>
            </button>
          ))}
        </aside>

        <section className="flex-1 rounded border bg-white p-4 space-y-5">
          {loading ? <div>Loading...</div> : !selectedComplaint ? <div>Выберите жалобу</div> : (
            <>
              <div>
                <div className="mb-1 text-sm font-semibold">ComplaintText</div>
                <textarea className="w-full rounded border px-3 py-2" rows={3} value={complaintDraft} onChange={(e) => setComplaintDraft(e.target.value)} />
                <button className="mt-2 rounded border px-3 py-2" onClick={() => void saveComplaintText()}>Сохранить</button>
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold">DiagnosticText</div>
                <div className="rounded border bg-slate-50 p-3 text-sm">{selectedComplaint.diagnosticText || 'Ожидает ответа механика'}</div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Работы</div>
                <table className="w-full text-sm border rounded overflow-hidden">
                  <thead className="bg-slate-50"><tr><th className="px-2 py-1 text-left">name</th><th className="px-2 py-1 text-left">qty</th><th className="px-2 py-1 text-left">priceRub</th><th className="px-2 py-1 text-left"></th></tr></thead>
                  <tbody>
                    {(selectedComplaint.labors ?? []).map((l) => (
                      <tr className="border-t" key={l.id}>
                        <td className="px-2 py-1">{l.name}</td><td className="px-2 py-1">{l.qty}</td><td className="px-2 py-1">{l.priceRub}</td>
                        <td className="px-2 py-1"><button className="text-red-600" onClick={() => void removeLabor(l.id)}>Удалить</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <form className="mt-2 grid grid-cols-4 gap-2" onSubmit={addLabor}>
                  <input className="rounded border px-2 py-1" placeholder="name" value={newLaborName} onChange={(e) => setNewLaborName(e.target.value)} required />
                  <input className="rounded border px-2 py-1" type="number" min={1} value={newLaborQty} onChange={(e) => setNewLaborQty(Number(e.target.value))} required />
                  <input className="rounded border px-2 py-1" type="number" min={0} value={newLaborPrice} onChange={(e) => setNewLaborPrice(Number(e.target.value))} required />
                  <button className="rounded border px-3 py-1">Добавить</button>
                </form>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Запчасти</div>
                <table className="w-full text-sm border rounded overflow-hidden">
                  <thead className="bg-slate-50"><tr><th className="px-2 py-1 text-left">name</th><th className="px-2 py-1 text-left">qty</th><th className="px-2 py-1 text-left">priceRub</th><th className="px-2 py-1 text-left">fromStock</th><th className="px-2 py-1 text-left"></th></tr></thead>
                  <tbody>
                    {(selectedComplaint.parts ?? []).map((p) => (
                      <tr className="border-t" key={p.id}>
                        <td className="px-2 py-1">{p.name}</td><td className="px-2 py-1">{p.qty}</td><td className="px-2 py-1">{p.priceRub}</td><td className="px-2 py-1">{String(p.fromStock)}</td>
                        <td className="px-2 py-1"><button className="text-red-600" onClick={() => void removePart(p.id)}>Удалить</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <form className="mt-2 grid grid-cols-5 gap-2" onSubmit={addPart}>
                  <input className="rounded border px-2 py-1" placeholder="name" value={newPartName} onChange={(e) => setNewPartName(e.target.value)} required />
                  <input className="rounded border px-2 py-1" type="number" min={1} value={newPartQty} onChange={(e) => setNewPartQty(Number(e.target.value))} required />
                  <input className="rounded border px-2 py-1" type="number" min={0} value={newPartPrice} onChange={(e) => setNewPartPrice(Number(e.target.value))} required />
                  <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={newPartFromStock} onChange={(e) => setNewPartFromStock(e.target.checked)} />stock</label>
                  <button className="rounded border px-3 py-1">Добавить</button>
                </form>
              </div>

              <div className="rounded bg-slate-50 p-3 text-sm">
                Итого по жалобе: работы {selectedComplaint.laborTotalRub ?? 0} руб | запчасти {selectedComplaint.partsTotalRub ?? 0} руб | всего {selectedComplaint.totalRub ?? 0} руб
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Согласование</div>
                <div className="flex gap-2">
                  <button className={`rounded px-3 py-2 border ${selectedComplaint.approvalStatus === 'PENDING' ? 'bg-slate-900 text-white' : ''}`} onClick={() => void setApproval('PENDING')}>PENDING</button>
                  <button className={`rounded px-3 py-2 border ${selectedComplaint.approvalStatus === 'ORDER' ? 'bg-slate-900 text-white' : ''}`} onClick={() => void setApproval('ORDER')}>В ЗН</button>
                  <button className={`rounded px-3 py-2 border ${selectedComplaint.approvalStatus === 'RECOMMENDATION' ? 'bg-slate-900 text-white' : ''}`} onClick={() => void setApproval('RECOMMENDATION')}>В рекомендации</button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {isAssignOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-6 flex items-center justify-center">
          <div className="w-full max-w-md rounded bg-white p-5 space-y-3">
            <h3 className="text-lg font-semibold">Назначить механика</h3>
            <select className="w-full rounded border px-3 py-2" value={selectedMechanicId} onChange={(e) => setSelectedMechanicId(e.target.value)}>
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.login})</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button className="rounded border px-3 py-2" onClick={() => setIsAssignOpen(false)}>Отмена</button>
              <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => void assignMechanic()}>Назначить</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
