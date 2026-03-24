import api, { getErrorMessage } from "@/lib/api";

// ────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// CREATE OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/** Create a new fuel record with optional receipt */
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

  const response = await api.post<FuelRecord>("/api/v1/fuel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// ────────────────────────────────────────────────────────────────────────────
// READ OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/** Get all fuel records */
export async function getAllFuelRecordsApi(): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>("/api/v1/fuel");
  return response.data;
}

/** Get a specific fuel record by ID */
export async function getFuelRecordByIdApi(id: string): Promise<FuelRecord> {
  const response = await api.get<FuelRecord>(`/api/v1/fuel/${id}`);
  return response.data;
}

/** Get fuel records for a specific vehicle */
export async function getFuelByVehicleApi(vehicleId: string): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>(`/api/v1/fuel/vehicle/${vehicleId}`);
  return response.data;
}

/** Get fuel records for a specific driver */
export async function getFuelByDriverApi(driverId: string): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>(`/api/v1/fuel/driver/${driverId}`);
  return response.data;
}

/** Get all flagged fuel records (suspicious/potential misuse) */
export async function getFlaggedFuelRecordsApi(): Promise<FuelRecord[]> {
  const response = await api.get<FuelRecord[]>("/api/v1/fuel/flagged");
  return response.data;
}

/** Search fuel records with filters (date range, vehicle, driver) */
export async function searchFuelRecordsApi(params: FuelFilterParams): Promise<FuelRecord[]> {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    ...(params.vehicleId && { vehicleId: params.vehicleId }),
    ...(params.driverId && { driverId: params.driverId }),
  });
  const response = await api.get<FuelRecord[]>(`/api/v1/fuel/search?${query.toString()}`);
  return response.data;
}

// Backward compatibility alias (deprecated, use searchFuelRecordsApi)
export async function getFilteredFuelRecordsApi(params: FuelFilterParams): Promise<FuelRecord[]> {
  return searchFuelRecordsApi(params);
}

// ────────────────────────────────────────────────────────────────────────────
// UPDATE OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/** Update a fuel record */
export async function updateFuelRecordApi(
  id: string,
  data: CreateFuelRecordData
): Promise<FuelRecord> {
  const response = await api.put<FuelRecord>(`/api/v1/fuel/${id}`, data);
  return response.data;
}

/** Partially update a fuel record */
export async function patchFuelRecordApi(
  id: string,
  data: Partial<CreateFuelRecordData>
): Promise<FuelRecord> {
  const response = await api.patch<FuelRecord>(`/api/v1/fuel/${id}`, data);
  return response.data;
}

// ────────────────────────────────────────────────────────────────────────────
// FLAG OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/** Flag a fuel record as suspicious/misuse */
export async function flagFuelRecordApi(id: string): Promise<FuelRecord> {
  const response = await api.patch<FuelRecord>(`/api/v1/fuel/${id}/flag`);
  return response.data;
}

/** Unflag a fuel record (mark as legitimate) */
export async function unflagFuelRecordApi(id: string): Promise<FuelRecord> {
  const response = await api.patch<FuelRecord>(`/api/v1/fuel/${id}/unflag`);
  return response.data;
}

// ────────────────────────────────────────────────────────────────────────────
// DELETE OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/** Delete a fuel record */
export async function deleteFuelRecordApi(id: string): Promise<void> {
  await api.delete(`/api/v1/fuel/${id}`);
}

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

/** Extract unique vehicles from fuel records */
export function extractUniqVehicles(records: FuelRecord[]): Array<{ id: string; label: string }> {
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

/** Extract unique drivers from fuel records */
export function extractUniqueDrivers(records: FuelRecord[]): Array<{ id: string; label: string }> {
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
