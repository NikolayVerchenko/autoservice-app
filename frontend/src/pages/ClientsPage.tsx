import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import type { Car, Client } from '../api';

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [createdClient, setCreatedClient] = useState<Client | null>(null);

  const [createName, setCreateName] = useState('');
  const [createPhone, setCreatePhone] = useState('');

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [createTelegramLink, setCreateTelegramLink] = useState<string | null>(null);
  const [editTelegramLink, setEditTelegramLink] = useState<string | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);

  const [createCars, setCreateCars] = useState<Car[]>([]);
  const [editCars, setEditCars] = useState<Car[]>([]);
  const [createPrimaryCarId, setCreatePrimaryCarId] = useState('');
  const [editPrimaryCarId, setEditPrimaryCarId] = useState('');

  const [createCarBrand, setCreateCarBrand] = useState('');
  const [createCarModel, setCreateCarModel] = useState('');
  const [editCarBrand, setEditCarBrand] = useState('');
  const [editCarModel, setEditCarModel] = useState('');

  async function loadClients() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listClients();
      setClients(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadClientCars(clientId: string, mode: 'create' | 'edit') {
    try {
      const cars = await api.listCars({ clientId });
      if (mode === 'create') {
        setCreateCars(cars);
      } else {
        setEditCars(cars);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  }

  useEffect(() => {
    void loadClients();
  }, []);

  async function onCreateClient(e: FormEvent) {
    e.preventDefault();
    try {
      const created = await api.createClient({
        name: createName.trim(),
        phone: createPhone.trim(),
      });
      setCreatedClient(created);
      setCreateName('');
      setCreatePhone('');
      setCreateTelegramLink(null);
      setCreatePrimaryCarId(created.primaryCarId ?? '');
      await loadClientCars(created.id, 'create');
      await loadClients();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function openEditModal(client: Client) {
    setSelectedClient(client);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditTelegramLink(null);
    setEditPrimaryCarId(client.primaryCarId ?? '');
    setEditCarBrand('');
    setEditCarModel('');
    void loadClientCars(client.id, 'edit');
    setIsEditOpen(true);
  }

  async function onEditClient(e: FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      await api.updateClient(selectedClient.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        primaryCarId: editPrimaryCarId || undefined,
      });
      setIsEditOpen(false);
      setSelectedClient(null);
      await loadClients();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function onDeleteClient(client: Client) {
    const confirmed = confirm(`Удалить клиента "${client.name}"?`);
    if (!confirmed) return;

    try {
      await api.deleteClient(client.id);
      await loadClients();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function loadCreateTelegramLink() {
    if (!createdClient) return;
    setTelegramLoading(true);
    try {
      const data = await api.getClientTelegramLink(createdClient.id);
      setCreateTelegramLink(data.tgLink);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setTelegramLoading(false);
    }
  }

  async function refreshCreateTelegramToken() {
    if (!createdClient) return;
    setTelegramLoading(true);
    try {
      const data = await api.refreshClientTelegramToken(createdClient.id);
      setCreateTelegramLink(data.tgLink);
      await loadClients();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setTelegramLoading(false);
    }
  }

  async function loadEditTelegramLink() {
    if (!selectedClient) return;
    setTelegramLoading(true);
    try {
      const data = await api.getClientTelegramLink(selectedClient.id);
      setEditTelegramLink(data.tgLink);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setTelegramLoading(false);
    }
  }

  async function refreshEditTelegramToken() {
    if (!selectedClient) return;
    setTelegramLoading(true);
    try {
      const data = await api.refreshClientTelegramToken(selectedClient.id);
      setEditTelegramLink(data.tgLink);
      await loadClients();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setTelegramLoading(false);
    }
  }

  async function copyLink(link: string | null) {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      alert('Ссылка скопирована');
    } catch {
      alert('Не удалось скопировать ссылку');
    }
  }

  async function createCarForCreatedClient() {
    if (!createdClient) return;
    if (!createCarBrand.trim() || !createCarModel.trim()) {
      alert('Введите марку и модель');
      return;
    }
    try {
      const car = await api.createCar({
        clientId: createdClient.id,
        brand: createCarBrand.trim(),
        model: createCarModel.trim(),
      });
      setCreateCarBrand('');
      setCreateCarModel('');
      await loadClientCars(createdClient.id, 'create');
      setCreatePrimaryCarId(car.id);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function createCarForEditClient() {
    if (!selectedClient) return;
    if (!editCarBrand.trim() || !editCarModel.trim()) {
      alert('Введите марку и модель');
      return;
    }
    try {
      const car = await api.createCar({
        clientId: selectedClient.id,
        brand: editCarBrand.trim(),
        model: editCarModel.trim(),
      });
      setEditCarBrand('');
      setEditCarModel('');
      await loadClientCars(selectedClient.id, 'edit');
      setEditPrimaryCarId(car.id);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Список клиентов</h2>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-2" onClick={() => void loadClients()}>
            Обновить
          </button>
          <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => setIsCreateOpen(true)}>
            Добавить клиента
          </button>
        </div>
      </div>

      {error ? <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">Имя</th>
              <th className="px-3 py-2">Телефон</th>
              <th className="px-3 py-2">Автомобиль</th>
              <th className="px-3 py-2">Telegram</th>
              <th className="px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={5}>Загрузка...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={5}>Клиентов пока нет</td></tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="px-3 py-2">{client.name}</td>
                  <td className="px-3 py-2">{client.phone}</td>
                  <td className="px-3 py-2">
                    {client.primaryCar ? `${client.primaryCar.brand} ${client.primaryCar.model}` : '-'}
                  </td>
                  <td className="px-3 py-2">
                    {client.telegramUserId ? <span className="text-emerald-700">Привязан</span> : <span className="text-amber-700">Не привязан</span>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button className="rounded border px-3 py-1" onClick={() => openEditModal(client)}>Редактировать</button>
                      <button className="rounded border border-red-300 px-3 py-1 text-red-700" onClick={() => void onDeleteClient(client)}>Удалить</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <form onSubmit={onCreateClient} className="w-full max-w-lg space-y-3 rounded bg-white p-5">
            <h3 className="text-lg font-semibold">Добавить клиента</h3>
            <input className="w-full rounded border px-3 py-2" placeholder="Имя" value={createName} onChange={(e) => setCreateName(e.target.value)} required />
            <input className="w-full rounded border px-3 py-2" placeholder="Телефон" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} required />

            <div className="rounded border bg-slate-50 p-3 space-y-2">
              <div className="text-sm font-medium">Автомобиль клиента</div>
              {!createdClient ? (
                <div className="text-xs text-slate-600">Сначала сохраните клиента, затем выберите или создайте автомобиль.</div>
              ) : (
                <>
                  <select className="w-full rounded border px-3 py-2" value={createPrimaryCarId} onChange={(e) => setCreatePrimaryCarId(e.target.value)}>
                    <option value="">Не выбран</option>
                    {createCars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.brand} {car.model} {car.plate ? `(${car.plate})` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input className="rounded border px-3 py-2" placeholder="Марка нового авто" value={createCarBrand} onChange={(e) => setCreateCarBrand(e.target.value)} />
                    <input className="rounded border px-3 py-2" placeholder="Модель нового авто" value={createCarModel} onChange={(e) => setCreateCarModel(e.target.value)} />
                  </div>
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void createCarForCreatedClient()}>
                    Создать автомобиль
                  </button>
                </>
              )}
            </div>

            <div className="rounded border bg-slate-50 p-3 space-y-2">
              <div className="text-sm font-medium">Telegram привязка</div>
              {!createdClient ? (
                <div className="text-xs text-slate-600">Сначала сохраните клиента, затем получите Telegram-ссылку.</div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded border px-3 py-1" onClick={() => void loadCreateTelegramLink()} disabled={telegramLoading || !createdClient}>
                  Получить ссылку
                </button>
                <button type="button" className="rounded border px-3 py-1" onClick={() => void refreshCreateTelegramToken()} disabled={telegramLoading || !createdClient}>
                  Обновить токен
                </button>
                {createTelegramLink ? (
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void copyLink(createTelegramLink)}>
                    Скопировать ссылку
                  </button>
                ) : null}
              </div>
              {createTelegramLink ? <div className="text-xs break-all">{createTelegramLink}</div> : null}
            </div>

            <div className="flex justify-end gap-2">
              {createdClient ? (
                <button
                  type="button"
                  className="rounded border px-3 py-2"
                  onClick={async () => {
                    try {
                      await api.updateClient(createdClient.id, { primaryCarId: createPrimaryCarId || undefined });
                      await loadClients();
                      alert('Автомобиль клиента сохранен');
                    } catch (e) {
                      alert((e as Error).message);
                    }
                  }}
                >
                  Сохранить автомобиль
                </button>
              ) : null}
              <button
                type="button"
                className="rounded border px-3 py-2"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreatedClient(null);
                  setCreateName('');
                  setCreatePhone('');
                  setCreateTelegramLink(null);
                  setCreateCars([]);
                  setCreatePrimaryCarId('');
                  setCreateCarBrand('');
                  setCreateCarModel('');
                }}
              >
                Отмена
              </button>
              <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white">
                {createdClient ? 'Создать еще клиента' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <form onSubmit={onEditClient} className="w-full max-w-lg space-y-3 rounded bg-white p-5">
            <h3 className="text-lg font-semibold">Редактировать клиента</h3>
            <input className="w-full rounded border px-3 py-2" placeholder="Имя" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            <input className="w-full rounded border px-3 py-2" placeholder="Телефон" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />

            <div className="rounded border bg-slate-50 p-3 space-y-2">
              <div className="text-sm font-medium">Автомобиль клиента</div>
              <select className="w-full rounded border px-3 py-2" value={editPrimaryCarId} onChange={(e) => setEditPrimaryCarId(e.target.value)}>
                <option value="">Не выбран</option>
                {editCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.brand} {car.model} {car.plate ? `(${car.plate})` : ''}
                  </option>
                ))}
              </select>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className="rounded border px-3 py-2" placeholder="Марка нового авто" value={editCarBrand} onChange={(e) => setEditCarBrand(e.target.value)} />
                <input className="rounded border px-3 py-2" placeholder="Модель нового авто" value={editCarModel} onChange={(e) => setEditCarModel(e.target.value)} />
              </div>
              <button type="button" className="rounded border px-3 py-1" onClick={() => void createCarForEditClient()}>
                Создать автомобиль
              </button>
            </div>

            {selectedClient ? (
              <div className="rounded border bg-slate-50 p-3 space-y-2">
                <div className="text-sm">
                  Статус Telegram:{' '}
                  <span className={selectedClient.telegramUserId ? 'text-emerald-700' : 'text-amber-700'}>
                    {selectedClient.telegramUserId ? 'Привязан' : 'Не привязан'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void loadEditTelegramLink()} disabled={telegramLoading}>
                    Получить ссылку
                  </button>
                  <button type="button" className="rounded border px-3 py-1" onClick={() => void refreshEditTelegramToken()} disabled={telegramLoading}>
                    Обновить токен
                  </button>
                  {editTelegramLink ? (
                    <button type="button" className="rounded border px-3 py-1" onClick={() => void copyLink(editTelegramLink)}>
                      Скопировать ссылку
                    </button>
                  ) : null}
                </div>
                {editTelegramLink ? <div className="text-xs break-all">{editTelegramLink}</div> : null}
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded border px-3 py-2"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditTelegramLink(null);
                  setEditCars([]);
                }}
              >
                Отмена
              </button>
              <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
