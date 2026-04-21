import api from "../api";

// ── Types ──
export type MaintenanceType = "BREAKDOWN" | "ROUTINE_SERVICE" | "ACCIDENT_DAMAGE";
export type MaintenanceStatus = "NEW" | "SUBMITTED" | "APPROVED" | "REJECTED" | "CLOSED";

export interface MaintenanceRequest {
  id: number;
  vehicleId: number;
  vehiclePlateNumber: string;
  vehicleBrandModel: string;
  maintenanceType: MaintenanceType;
  description: string;
  status: MaintenanceStatus;
  estimatedCost: number | null;
  actualCost: number | null;
  requestedDate: string;
  approvedDate: string | null;
  closedDate: string | null;
  rejectionReason: string | null;
  quotationUrl: string | null;
  invoiceUrl: string | null;
  downtimeHours: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceFormData {
  vehicleId: number;
  maintenanceType: MaintenanceType;
  description: string;
  estimatedCost?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── API Calls ──
export const maintenanceApi = {
  getAll: () =>
    api.get<ApiResponse<MaintenanceRequest[]>>("/api/maintenance").then((r) => r.data),

  getByStatus: (status: MaintenanceStatus) =>
    api.get<ApiResponse<MaintenanceRequest[]>>(`/api/maintenance?status=${status}`).then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<MaintenanceRequest>>(`/api/maintenance/${id}`).then((r) => r.data),

  create: (data: MaintenanceFormData) =>
    api.post<ApiResponse<MaintenanceRequest>>("/api/maintenance", data).then((r) => r.data),

  update: (id: number, data: MaintenanceFormData) =>
    api.put<ApiResponse<MaintenanceRequest>>(`/api/maintenance/${id}`, data).then((r) => r.data),

  submit: (id: number) =>
    api.patch<ApiResponse<MaintenanceRequest>>(`/api/maintenance/${id}/submit`).then((r) => r.data),

  approve: (id: number) =>
    api.patch<ApiResponse<MaintenanceRequest>>(`/api/maintenance/${id}/approve`).then((r) => r.data),

  reject: (id: number, reason: string) =>
    api.patch<ApiResponse<MaintenanceRequest>>(`/api/maintenance/${id}/reject?reason=${encodeURIComponent(reason)}`).then((r) => r.data),

  close: (id: number, actualCost: number) =>
    api.patch<ApiResponse<MaintenanceRequest>>(`/api/maintenance/${id}/close?actualCost=${actualCost}`).then((r) => r.data),

  uploadQuotation: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<MaintenanceRequest>>(`/api/maintenance/${id}/quotation`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  uploadInvoice: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<MaintenanceRequest>>(`/api/maintenance/${id}/invoice`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  getByVehicle: (vehicleId: number) =>
    api.get<ApiResponse<MaintenanceRequest[]>>(`/api/maintenance?vehicleId=${vehicleId}`).then((r) => r.data),

  getDowntimeReport: (vehicleId: number) =>
    api.get<ApiResponse<MaintenanceRequest[]>>(`/api/maintenance/reports/downtime?vehicleId=${vehicleId}`).then((r) => r.data),

  getPendingApprovals: () =>
    api.get<ApiResponse<MaintenanceRequest[]>>("/api/maintenance/reports/pending").then((r) => r.data),
};
