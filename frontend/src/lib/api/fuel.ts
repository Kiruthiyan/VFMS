import api, { getErrorMessage } from "@/lib/api";

// ── TYPES ─────────────────────────────────────────────────────────────────

export interface FuelRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleMakeModel: string;
  driverId: string | null;
  driverName: string | null;
  fuelDate: string;
  quantity: number;
  costPerLitre: number;
  totalCost: number;
  odometerReading: number;
  fuelStation: string | null;
  notes: string | null;
  receiptUrl: string | null;
  receiptFileName: string | null;
  flaggedForMisuse: boolean;
  flagReason: string | null;
  createdBy: string;
  createdAt: string;
  efficiencyKmPerLitre: number | null;
  distanceSinceLast: number | null;
}

export interface CreateFuelRecordData {
  vehicleId: string;
  driverId?: string;
  fuelDate: string;
  quantity: number;
  costPerLitre: number;
  odometerReading: number;
  fuelStation?: string;
  notes?: string;
}

export interface FuelFilterParams {
  from: string;
  to: string;
  vehicleId?: string;
  driverId?: string;
}

// ── API CALLS ─────────────────────────────────────────────────────────────

export async function createFuelRecordApi(
  data: CreateFuelRecordData,
  receipt?: File
): Promise<FuelRecord> {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)],
    { type: "application/json" }));
  if (receipt) {
    formData.append("receipt", receipt);
  }

  const response = await api.post<FuelRecord>("/api/fuel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getAllFuelRecordsApi(): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>("/api/fuel");
  return response.data;
}

export async function getFuelRecordByIdApi(id: string): Promise<FuelRecord> {
  const response = await api.get<FuelRecord>(`/api/fuel/${id}`);
  return response.data;
}

export async function getFuelByVehicleApi(
  vehicleId: string
): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>(
    `/api/fuel/vehicle/${vehicleId}`
  );
  return response.data;
}

export async function getFuelByDriverApi(
  driverId: string
): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>(
    `/api/fuel/driver/${driverId}`
  );
  return response.data;
}

export async function getFlaggedFuelRecordsApi(): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>("/api/fuel/flagged");
  return response.data;
}

export async function getFilteredFuelRecordsApi(
  params: FuelFilterParams
): Promise<FuelRecord[]> {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    ...(params.vehicleId && { vehicleId: params.vehicleId }),
    ...(params.driverId && { driverId: params.driverId }),
  });
  const response = await api.get<FuelRecord[]>(
    `/api/fuel/filter?${query.toString()}`
  );
  return response.data;
}

export { getErrorMessage };
