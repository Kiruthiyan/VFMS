import api from "../api";

// ── Types ──
export type RentalStatus = "ACTIVE" | "RETURNED" | "CLOSED";

export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
}

export interface VendorFormData {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface RentalRecord {
  id: number;
  vendorId: number;
  vendorName: string;
  vehicleType: string;
  plateNumber: string;
  startDate: string;
  endDate: string | null;
  costPerDay: number;
  totalCost: number | null;
  purpose: string | null;
  status: RentalStatus;
  agreementUrl: string | null;
  invoiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalFormData {
  vendorId: number;
  vehicleType: string;
  plateNumber: string;
  startDate: string;
  endDate?: string;
  costPerDay: number;
  purpose?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Vendor API ──
export const vendorApi = {
  getAll: () =>
    api.get<ApiResponse<Vendor[]>>("/api/vendors").then((r) => r.data),

  getAllIncludingInactive: () =>
    api.get<ApiResponse<Vendor[]>>("/api/vendors/all").then((r) => r.data),

  create: (data: VendorFormData) =>
    api.post<ApiResponse<Vendor>>("/api/vendors", data).then((r) => r.data),

  update: (id: number, data: VendorFormData) =>
    api.put<ApiResponse<Vendor>>(`/api/vendors/${id}`, data).then((r) => r.data),

  toggleStatus: (id: number) =>
    api.patch<ApiResponse<Vendor>>(`/api/vendors/${id}/toggle-status`).then((r) => r.data),
};

// ── Rental API ──
export const rentalApi = {
  getAll: () =>
    api.get<ApiResponse<RentalRecord[]>>("/api/rentals").then((r) => r.data),

  getByStatus: (status: RentalStatus) =>
    api.get<ApiResponse<RentalRecord[]>>(`/api/rentals?status=${status}`).then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<RentalRecord>>(`/api/rentals/${id}`).then((r) => r.data),

  create: (data: RentalFormData) =>
    api.post<ApiResponse<RentalRecord>>("/api/rentals", data).then((r) => r.data),

  update: (id: number, data: RentalFormData) =>
    api.put<ApiResponse<RentalRecord>>(`/api/rentals/${id}`, data).then((r) => r.data),

  confirmReturn: (id: number, returnDate: string) =>
    api.patch<ApiResponse<RentalRecord>>(`/api/rentals/${id}/return?returnDate=${returnDate}`).then((r) => r.data),

  close: (id: number) =>
    api.patch<ApiResponse<RentalRecord>>(`/api/rentals/${id}/close`).then((r) => r.data),

  uploadAgreement: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<RentalRecord>>(`/api/rentals/${id}/agreement`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  uploadInvoice: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<RentalRecord>>(`/api/rentals/${id}/invoice`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
};
