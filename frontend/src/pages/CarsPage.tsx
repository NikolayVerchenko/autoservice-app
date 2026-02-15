import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import type { Car, Client } from '../api';

export function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const [createClientId, setCreateClientId] = useState('');
  const [createBrand, setCreateBrand] = useState('');
  const [createModel, setCreateModel] = useState('');
  const [createYear, setCreateYear] = useState('');
  const [createVin, setCreateVin] = useState('');
  const [createPlate, setCreatePlate] = useState('');
  const [createMileage, setCreateMileage] = useState('');

  const [editClientId, setEditClientId] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editVin, setEditVin] = useState('');
  const [editPlate, setEditPlate] = useState('');
  const [editMileage, setEditMileage] = useState('');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [carsData, clientsData] = await Promise.all([api.listCars(), api.listClients()]);
      setCars(carsData);
      setClients(clientsData);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetCreateForm() {
    setCreateClientId('');
    setCreateBrand('');
    setCreateModel('');
    setCreateYear('');
    setCreateVin('');
    setCreatePlate('');
    setCreateMileage('');
  }

  async function onCreateCar(e: FormEvent) {
    e.preventDefault();
    try {
      await api.createCar({
        clientId: createClientId,
        brand: createBrand.trim(),
        model: createModel.trim(),
        year: createYear.trim() ? Number(createYear) : undefined,
        vin: createVin.trim() || undefined,
        plate: createPlate.trim() || undefined,
        mileage: createMileage.trim() ? Number(createMileage) : undefined,
      });
      setIsCreateOpen(false);
      resetCreateForm();
      await loadData();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function openEditModal(car: Car) {
    setSelectedCar(car);
    setEditClientId(car.clientId);
    setEditBrand(car.brand);
    setEditModel(car.model);
    setEditYear(car.year != null ? String(car.year) : '');
    setEditVin(car.vin ?? '');
    setEditPlate(car.plate ?? '');
    setEditMileage(car.mileage != null ? String(car.mileage) : '');
    setIsEditOpen(true);
  }

  async function onEditCar(e: FormEvent) {
    e.preventDefault();
    if (!selectedCar) return;
    try {
      await api.updateCar(selectedCar.id, {
        clientId: editClientId,
        brand: editBrand.trim(),
        model: editModel.trim(),
        year: editYear.trim() ? Number(editYear) : undefined,
        vin: editVin.trim(),
        plate: editPlate.trim(),
        mileage: editMileage.trim() ? Number(editMileage) : undefined,
      });
      setIsEditOpen(false);
      setSelectedCar(null);
      await loadData();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function onDeleteCar(car: Car) {
    const confirmed = confirm(`Удалить автомобиль "${car.brand} ${car.model}"?`);
    if (!confirmed) return;
    try {
      await api.deleteCar(car.id);
      await loadData();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function clientLabel(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.name} (${client.phone})` : clientId;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Список автомобилей</h2>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-2" onClick={() => void loadData()}>
            Обновить
          </button>
          <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => setIsCreateOpen(true)}>
            Добавить автомобиль
          </button>
        </div>
      </div>

      {error ? <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">Клиент</th>
              <th className="px-3 py-2">Марка</th>
              <th className="px-3 py-2">Модель</th>
              <th className="px-3 py-2">Госномер</th>
              <th className="px-3 py-2">VIN</th>
              <th className="px-3 py-2">Пробег</th>
              <th className="px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={7}>Загрузка...</td></tr>
            ) : cars.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={7}>Автомобилей пока нет</td></tr>
            ) : (
              cars.map((car) => (
                <tr key={car.id} className="border-t">
                  <td className="px-3 py-2">{clientLabel(car.clientId)}</td>
                  <td className="px-3 py-2">{car.brand}</td>
                  <td className="px-3 py-2">{car.model}</td>
                  <td className="px-3 py-2">{car.plate ?? '-'}</td>
                  <td className="px-3 py-2">{car.vin ?? '-'}</td>
                  <td className="px-3 py-2">{car.mileage ?? '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button className="rounded border px-3 py-1" onClick={() => openEditModal(car)}>
                        Редактировать
                      </button>
                      <button
                        className="rounded border border-red-300 px-3 py-1 text-red-700"
                        onClick={() => void onDeleteCar(car)}
                      >
                        Удалить
                      </button>
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
          <form onSubmit={onCreateCar} className="w-full max-w-lg space-y-3 rounded bg-white p-5">
            <h3 className="text-lg font-semibold">Добавить автомобиль</h3>
            <select className="w-full rounded border px-3 py-2" value={createClientId} onChange={(e) => setCreateClientId(e.target.value)} required>
              <option value="">Выберите клиента</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.phone})
                </option>
              ))}
            </select>
            <input className="w-full rounded border px-3 py-2" placeholder="Марка" value={createBrand} onChange={(e) => setCreateBrand(e.target.value)} required />
            <input className="w-full rounded border px-3 py-2" placeholder="Модель" value={createModel} onChange={(e) => setCreateModel(e.target.value)} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="w-full rounded border px-3 py-2" type="number" placeholder="Год" value={createYear} onChange={(e) => setCreateYear(e.target.value)} />
              <input className="w-full rounded border px-3 py-2" type="number" placeholder="Пробег" value={createMileage} onChange={(e) => setCreateMileage(e.target.value)} />
            </div>
            <input className="w-full rounded border px-3 py-2" placeholder="VIN" value={createVin} onChange={(e) => setCreateVin(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Госномер" value={createPlate} onChange={(e) => setCreatePlate(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-2" onClick={() => setIsCreateOpen(false)}>Отмена</button>
              <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white">Сохранить</button>
            </div>
          </form>
        </div>
      ) : null}

      {isEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <form onSubmit={onEditCar} className="w-full max-w-lg space-y-3 rounded bg-white p-5">
            <h3 className="text-lg font-semibold">Редактировать автомобиль</h3>
            <select className="w-full rounded border px-3 py-2" value={editClientId} onChange={(e) => setEditClientId(e.target.value)} required>
              <option value="">Выберите клиента</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.phone})
                </option>
              ))}
            </select>
            <input className="w-full rounded border px-3 py-2" placeholder="Марка" value={editBrand} onChange={(e) => setEditBrand(e.target.value)} required />
            <input className="w-full rounded border px-3 py-2" placeholder="Модель" value={editModel} onChange={(e) => setEditModel(e.target.value)} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="w-full rounded border px-3 py-2" type="number" placeholder="Год" value={editYear} onChange={(e) => setEditYear(e.target.value)} />
              <input className="w-full rounded border px-3 py-2" type="number" placeholder="Пробег" value={editMileage} onChange={(e) => setEditMileage(e.target.value)} />
            </div>
            <input className="w-full rounded border px-3 py-2" placeholder="VIN" value={editVin} onChange={(e) => setEditVin(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Госномер" value={editPlate} onChange={(e) => setEditPlate(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-2" onClick={() => setIsEditOpen(false)}>Отмена</button>
              <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white">Сохранить</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
