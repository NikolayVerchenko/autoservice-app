type ApiError = {
  message?: string | string[];
  statusCode?: number;
};

export type Appointment = {
  id: string;
  clientId: string;
  carId: string;
  defectId: string | null;
  startAt: string;
  endAt: string;
  status: 'PLANNED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELED' | 'DONE';
  comment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Mechanic = {
  id: string;
  role: 'MECHANIC';
  name: string;
  login: string;
  telegramUserId: string | null;
};

export type ComplaintLabor = {
  id: string;
  complaintId: string;
  name: string;
  qty: number;
  priceRub: number;
};

export type ComplaintPart = {
  id: string;
  complaintId: string;
  name: string;
  qty: number;
  priceRub: number;
  fromStock: boolean;
};

export type DefectComplaint = {
  id: string;
  defectId: string;
  idx: number;
  complaintText: string;
  diagnosticText: string | null;
  diagnosticStatus: 'NEED_REPLY' | 'REPLIED';
  approvalStatus: 'PENDING' | 'ORDER' | 'RECOMMENDATION';
  labors?: ComplaintLabor[];
  parts?: ComplaintPart[];
  laborTotalRub?: number;
  partsTotalRub?: number;
  totalRub?: number;
};

export type Defect = {
  id: string;
  number: string;
  clientId: string;
  carId: string;
  assignedMechanicId?: string | null;
  status: string;
  createdAt: string;
  client?: { id: string; name: string; telegramUserId?: string | null };
  car?: { id: string; brand: string; model: string; plate?: string | null };
  complaints: DefectComplaint[];
  totals?: {
    laborTotalRub: number;
    partsTotalRub: number;
    totalRub: number;
  };
};

export type Order = {
  id: string;
  number: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  telegramUserId: string | null;
  tgInviteToken: string | null;
  tgLinkedAt: string | null;
  primaryCarId: string | null;
  primaryCar?: Car | null;
  createdAt: string;
  updatedAt: string;
};

export type Car = {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  year: number | null;
  vin: string | null;
  plate: string | null;
  mileage: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientTelegramLink = {
  tgInviteToken: string | null;
  tgLink: string;
};

export type VehicleBrand = {
  id: string;
  name: string;
};

export type VehicleModel = {
  id: string;
  brandId: string;
  name: string;
};

export type SystemSettings = {
  id: number;
  publicBotUsername: string | null;
  publicAppUrl: string | null;
  telegramBotToken: string | null;
  updatedAt: string;
};

type CreateAppointmentPayload = {
  clientId: string;
  carId: string;
  defectId: string | null;
  startAt: string;
  endAt: string;
  comment?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const response = await fetch(`/api${normalizedPath}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let errorPayload: ApiError | undefined;
    try {
      errorPayload = (await response.json()) as ApiError;
    } catch {
      errorPayload = undefined;
    }

    const message = Array.isArray(errorPayload?.message)
      ? errorPayload?.message.join(', ')
      : errorPayload?.message || 'Request failed';

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const api = {
  listClients() {
    return request<Client[]>('/clients');
  },

  getClient(clientId: string) {
    return request<Client>(`/clients/${clientId}`);
  },

  createClient(payload: { name: string; phone: string; telegramUserId?: string; primaryCarId?: string }) {
    return request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateClient(clientId: string, payload: { name?: string; phone?: string; telegramUserId?: string; primaryCarId?: string | null }) {
    return request<Client>(`/clients/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteClient(clientId: string) {
    return request<{ deleted: true }>(`/clients/${clientId}`, {
      method: 'DELETE',
    });
  },

  listCars(params?: { clientId?: string }) {
    const query = new URLSearchParams();
    if (params?.clientId) {
      query.set('clientId', params.clientId);
    }

    return request<Car[]>(query.size > 0 ? `/cars?${query.toString()}` : '/cars');
  },

  listVehicleBrands() {
    return request<VehicleBrand[]>('/vehicle-brands');
  },

  listVehicleModels(params?: { brandId?: string }) {
    const query = new URLSearchParams();
    if (params?.brandId) {
      query.set('brandId', params.brandId);
    }
    return request<VehicleModel[]>(query.size > 0 ? `/vehicle-models?${query.toString()}` : '/vehicle-models');
  },

  createCar(payload: {
    clientId: string;
    brand: string;
    model: string;
    year?: number;
    vin?: string;
    plate?: string;
    mileage?: number;
  }) {
    return request<Car>('/cars', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateCar(
    carId: string,
    payload: {
      clientId?: string;
      brand?: string;
      model?: string;
      year?: number;
      vin?: string;
      plate?: string;
      mileage?: number;
    },
  ) {
    return request<Car>(`/cars/${carId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteCar(carId: string) {
    return request<{ deleted: true }>(`/cars/${carId}`, {
      method: 'DELETE',
    });
  },

  getClientTelegramLink(clientId: string) {
    return request<ClientTelegramLink>(`/clients/${clientId}/tg-link`);
  },

  refreshClientTelegramToken(clientId: string) {
    return request<ClientTelegramLink>(`/clients/${clientId}/tg-refresh-token`, {
      method: 'POST',
    });
  },

  getSettings() {
    return request<SystemSettings>('/settings');
  },

  updateSettings(payload: { publicBotUsername?: string; publicAppUrl?: string; telegramBotToken?: string }) {
    return request<SystemSettings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  listAppointments(params: { from: string; to: string }) {
    const query = new URLSearchParams(params);
    return request<Appointment[]>(`/appointments?${query.toString()}`);
  },

  createAppointment(payload: CreateAppointmentPayload) {
    return request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listDefects() {
    return request<Defect[]>('/defects');
  },

  getDefect(id: string) {
    return request<Defect>(`/defects/${id}`);
  },

  listMechanics() {
    return request<Mechanic[]>('/users?role=MECHANIC');
  },

  assignMechanic(defectId: string, mechanicId: string) {
    return request<Defect>(`/defects/${defectId}/assign-mechanic`, {
      method: 'POST',
      body: JSON.stringify({ mechanicId }),
    });
  },

  sendDefectToClient(defectId: string) {
    return request<{ ok: true }>(`/defects/${defectId}/send-to-client`, {
      method: 'POST',
    });
  },

  patchComplaint(id: string, payload: Partial<Pick<DefectComplaint, 'complaintText'>>) {
    return request<DefectComplaint>(`/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  patchComplaintApproval(id: string, approvalStatus: 'PENDING' | 'ORDER' | 'RECOMMENDATION') {
    return request<DefectComplaint>(`/complaints/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ approvalStatus }),
    });
  },

  addLabor(complaintId: string, payload: { name: string; qty: number; priceRub: number }) {
    return request<ComplaintLabor>(`/complaints/${complaintId}/labors`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteLabor(laborId: string) {
    return request<{ deleted: true }>(`/complaint-labors/${laborId}`, {
      method: 'DELETE',
    });
  },

  addPart(
    complaintId: string,
    payload: { name: string; qty: number; priceRub: number; fromStock: boolean },
  ) {
    return request<ComplaintPart>(`/complaints/${complaintId}/parts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deletePart(partId: string) {
    return request<{ deleted: true }>(`/complaint-parts/${partId}`, {
      method: 'DELETE',
    });
  },

  createOrder(defectId: string) {
    return request<Order>(`/defects/${defectId}/create-order`, {
      method: 'POST',
    });
  },
};
