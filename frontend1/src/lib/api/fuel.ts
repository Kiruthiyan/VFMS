import api, { getErrorMessage } from "@/lib/api";

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

export interface FuelLookupOption {
  id: string;
  label: string;
}

export interface FuelFormMetadata {
  vehicles: FuelLookupOption[];
  drivers: FuelLookupOption[];
}

export async function createFuelRecordApi(
  data: CreateFuelRecordData,
  receipt?: File
): Promise<FuelRecord> {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );

  if (receipt) {
    formData.append("receipt", receipt);
  }

  const response = await api.post<FuelRecord>("/api/v1/fuel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getAllFuelRecordsApi(): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>("/api/v1/fuel");
  return response.data;
}

export async function getFuelFormMetadataApi(): Promise<FuelFormMetadata> {
  const response = await api.get<FuelFormMetadata>("/api/v1/fuel/metadata");
  return response.data;
}

export async function getFuelRecordByIdApi(id: string): Promise<FuelRecord> {
  const response = await api.get<FuelRecord>(`/api/v1/fuel/${id}`);
  return response.data;
}

export async function getFuelByVehicleApi(
  vehicleId: string
): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>(
    `/api/v1/fuel/vehicle/${vehicleId}`
  );
  return response.data;
}

export async function getFuelByDriverApi(
  driverId: string
): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>(
    `/api/v1/fuel/driver/${driverId}`
  );
  return response.data;
}

export async function getFlaggedFuelRecordsApi(): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>("/api/v1/fuel/flagged");
  return response.data;
}

export async function searchFuelRecordsApi(
  params: FuelFilterParams
): Promise<FuelRecord[]> {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    ...(params.vehicleId && { vehicleId: params.vehicleId }),
    ...(params.driverId && { driverId: params.driverId }),
  });
  const response = await api.get<FuelRecord[]>(
    `/api/v1/fuel/search?${query.toString()}`
  );
  return response.data;
}

export async function getFilteredFuelRecordsApi(
  params: FuelFilterParams
): Promise<FuelRecord[]> {
  return searchFuelRecordsApi(params);
}

export async function updateFuelRecordApi(
  id: string,
  data: CreateFuelRecordData
): Promise<FuelRecord> {
  const response = await api.put<FuelRecord>(`/api/v1/fuel/${id}`, data);
  return response.data;
}

export async function patchFuelRecordApi(
  id: string,
  data: Partial<CreateFuelRecordData>
): Promise<FuelRecord> {
  const response = await api.patch<FuelRecord>(`/api/v1/fuel/${id}`, data);
  return response.data;
}

export async function flagFuelRecordApi(id: string): Promise<FuelRecord> {
  const response = await api.patch<FuelRecord>(`/api/v1/fuel/${id}/flag`);
  return response.data;
}

export async function unflagFuelRecordApi(id: string): Promise<FuelRecord> {
  const response = await api.patch<FuelRecord>(`/api/v1/fuel/${id}/unflag`);
  return response.data;
}

export async function deleteFuelRecordApi(id: string): Promise<void> {
  await api.delete(`/api/v1/fuel/${id}`);
}

export function extractUniqVehicles(
  records: FuelRecord[]
): Array<{ id: string; label: string }> {
  const vehicleMap = new Map<string, string>();

  records.forEach((record) => {
    if (!vehicleMap.has(record.vehicleId)) {
      vehicleMap.set(record.vehicleId, record.vehiclePlate);
    }
  });

  return Array.from(vehicleMap.entries())
    .map(([id, plate]) => ({ id, label: plate }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function extractUniqueDrivers(
  records: FuelRecord[]
): Array<{ id: string; label: string }> {
  const driverMap = new Map<string, string>();

  records.forEach((record) => {
    if (record.driverId && record.driverName && !driverMap.has(record.driverId)) {
      driverMap.set(record.driverId, record.driverName);
    }
  });

  return Array.from(driverMap.entries())
    .map(([id, name]) => ({ id, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export { getErrorMessage };
