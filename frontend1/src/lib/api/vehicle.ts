import api from "../api";

// ── Types ──
export type VehicleType = "CAR" | "VAN" | "SUV" | "BUS" | "MOTORCYCLE";
export type FuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";
export type VehicleStatus = "AVAILABLE" | "UNDER_MAINTENANCE" | "RETIRED";

export interface Vehicle {
  id: number;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  fuelType: FuelType;
  status: VehicleStatus;
  department?: string;
  color?: string;
  seatingCapacity?: number;
  insuranceExpiryDate?: string;
  revenueLicenseExpiryDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  fuelType: FuelType;
  department?: string;
  color?: string;
  seatingCapacity?: number;
  insuranceExpiryDate?: string;
  revenueLicenseExpiryDate?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── API Calls ──
export const vehicleApi = {
  getAll: () =>
    api.get<ApiResponse<Vehicle[]>>("/api/vehicles").then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Vehicle>>(`/api/vehicles/${id}`).then((r) => r.data),

  create: (data: VehicleFormData) =>
    api.post<ApiResponse<Vehicle>>("/api/vehicles", data).then((r) => r.data),

  update: (id: number, data: VehicleFormData) =>
    api
      .put<ApiResponse<Vehicle>>(`/api/vehicles/${id}`, data)
      .then((r) => r.data),

  retire: (id: number) =>
    api
      .patch<ApiResponse<Vehicle>>(`/api/vehicles/${id}/retire`)
      .then((r) => r.data),

  filterByStatus: (status: VehicleStatus) =>
    api
      .get<ApiResponse<Vehicle[]>>(`/api/vehicles?status=${status}`)
      .then((r) => r.data),
};
