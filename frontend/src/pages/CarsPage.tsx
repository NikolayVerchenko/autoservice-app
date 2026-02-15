import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { Car, Client, VehicleBrand, VehicleModel } from '../api';

export function CarsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedClientId = searchParams.get('clientId') ?? '';
  const returnTo = searchParams.get('returnTo') ?? '';
  const returnModal = searchParams.get('returnModal') ?? '';
  const [cars, setCars] = useState<Car[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [createModels, setCreateModels] = useState<VehicleModel[]>([]);
  const [editModels, setEditModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const [createClientId, setCreateClientId] = useState('');
  const [createBrandId, setCreateBrandId] = useState('');
  const [createModelId, setCreateModelId] = useState('');
  const [createYear, setCreateYear] = useState('');
  const [createVin, setCreateVin] = useState('');
  const [createPlate, setCreatePlate] = useState('');
  const [createMileage, setCreateMileage] = useState('');

  const [editClientId, setEditClientId] = useState('');
  const [editBrandId, setEditBrandId] = useState('');
  const [editModelId, setEditModelId] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editVin, setEditVin] = useState('');
  const [editPlate, setEditPlate] = useState('');
  const [editMileage, setEditMileage] = useState('');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [carsData, clientsData, brandsData] = await Promise.all([
        api.listCars(),
        api.listClients(),
        api.listVehicleBrands(),
      ]);
      setCars(carsData);
      setClients(clientsData);
      setBrands(brandsData);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      setCreateClientId(selectedClientId);
    }
  }, [selectedClientId]);

  function resetCreateForm() {
    setCreateClientId('');
    setCreateBrandId('');
    setCreateModelId('');
    setCreateModels([]);
    setCreateYear('');
    setCreateVin('');
    setCreatePlate('');
    setCreateMileage('');
  }

  async function onCreateBrandChange(brandId: string) {
    setCreateBrandId(brandId);
    setCreateModelId('');
    if (!brandId) {
      setCreateModels([]);
      return;
    }
    const models = await api.listVehicleModels({ brandId });
    setCreateModels(models);
  }

  async function onEditBrandChange(brandId: string) {
    setEditBrandId(brandId);
    setEditModelId('');
    if (!brandId) {
      setEditModels([]);
      return;
    }
    const models = await api.listVehicleModels({ brandId });
    setEditModels(models);
  }

  async function onCreateCar(e: FormEvent) {
    e.preventDefault();
    try {
      const brand = brands.find((item) => item.id === createBrandId);
      const model = createModels.find((item) => item.id === createModelId);
      if (!brand || !model) {
        alert('Выберите марку и модель из справочника');
        return;
      }

      const created = await api.createCar({
        clientId: createClientId,
        brand: brand.name,
        model: model.name,
        year: createYear.trim() ? Number(createYear) : undefined,
        vin: createVin.trim() || undefined,
        plate: createPlate.trim() || undefined,
        mileage: createMileage.trim() ? Number(createMileage) : undefined,
      });
      // In client-selection mode, immediately bind created car and return to client modal.
      if (selectedClientId && returnTo === 'clients' && createClientId === selectedClientId) {
        await api.updateClient(selectedClientId, { primaryCarId: created.id });
        if (returnModal === 'edit') {
          navigate(`/clients?editClientId=${selectedClientId}&selectedCarId=${created.id}`);
        } else {
          navigate(`/clients?createClientId=${selectedClientId}&selectedCarId=${created.id}`);
        }
        return;
      }

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
    const initialBrand = brands.find((brand) => brand.name === car.brand) ?? null;
    setEditBrandId(initialBrand?.id ?? '');
    if (initialBrand) {
      void api.listVehicleModels({ brandId: initialBrand.id }).then((models) => {
        setEditModels(models);
        const initialModel = models.find((model) => model.name === car.model) ?? null;
        setEditModelId(initialModel?.id ?? '');
      });
    } else {
      setEditModels([]);
      setEditModelId('');
    }
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
      const brand = brands.find((item) => item.id === editBrandId);
      const model = editModels.find((item) => item.id === editModelId);
      if (!brand || !model) {
        alert('Выберите марку и модель из справочника');
        return;
      }

      await api.updateCar(selectedCar.id, {
        clientId: editClientId,
        brand: brand.name,
        model: model.name,
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

  const selectedClient = selectedClientId ? clients.find((client) => client.id === selectedClientId) ?? null : null;

  async function assignCarToSelectedClient(carId: string) {
    if (!selectedClientId) return;
    try {
      await api.updateClient(selectedClientId, { primaryCarId: carId });
      await loadData();
      if (returnTo === 'clients') {
        if (returnModal === 'edit') {
          navigate(`/clients?editClientId=${selectedClientId}&selectedCarId=${carId}`);
        } else {
          navigate(`/clients?createClientId=${selectedClientId}&selectedCarId=${carId}`);
        }
        return;
      }
      alert('Автомобиль выбран для клиента');
    } catch (e) {
      alert((e as Error).message);
    }
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
      {selectedClient ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm">
          Выбор автомобиля для клиента: <span className="font-semibold">{selectedClient.name}</span> ({selectedClient.phone})
        </div>
      ) : null}

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
                      {selectedClientId && car.clientId === selectedClientId ? (
                        <button
                          className="rounded border border-emerald-300 px-3 py-1 text-emerald-700"
                          onClick={() => void assignCarToSelectedClient(car.id)}
                        >
                          Выбрать для клиента
                        </button>
                      ) : null}
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
            <select
              className="w-full rounded border px-3 py-2"
              value={createBrandId}
              onChange={(e) => void onCreateBrandChange(e.target.value)}
              required
            >
              <option value="">Выберите марку</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded border px-3 py-2"
              value={createModelId}
              onChange={(e) => setCreateModelId(e.target.value)}
              required
            >
              <option value="">Выберите модель</option>
              {createModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
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
            <select
              className="w-full rounded border px-3 py-2"
              value={editBrandId}
              onChange={(e) => void onEditBrandChange(e.target.value)}
              required
            >
              <option value="">Выберите марку</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded border px-3 py-2"
              value={editModelId}
              onChange={(e) => setEditModelId(e.target.value)}
              required
            >
              <option value="">Выберите модель</option>
              {editModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
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
