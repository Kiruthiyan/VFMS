import api, { getErrorMessage } from "@/lib/api";
import type { UserRole, UserStatus } from "@/lib/auth";

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nic: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdByAdmin: boolean;
  passwordChangeRequired: boolean;
  deletedAt: string | null;
  deletedReason: string | null;
  createdBy: string | null;
  deletedBy: string | null;
  restoredBy: string | null;
  licenseNumber: string | null;
  licenseExpiryDate: string | null;
  certifications: string | null;
  experienceYears: number | null;
  employeeId: string | null;
  department: string | null;
  officeLocation: string | null;
  designation: string | null;
  approvalLevel: string | null;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone?: string;
  nic: string;
  role: UserRole;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  certifications?: string;
  experienceYears?: number;
  employeeId?: string;
  department?: string;
  officeLocation?: string;
  designation?: string;
  approvalLevel?: string;
}

export interface ReviewUserRequest {
  decision: "APPROVE" | "REJECT";
  assignedRole?: UserRole;
  rejectionReason?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  nic?: string;
  role?: UserRole;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  certifications?: string;
  experienceYears?: number;
  employeeId?: string;
  department?: string;
  officeLocation?: string;
  designation?: string;
  approvalLevel?: string;
}

export interface SoftDeleteRequest {
  reason: string;
}

export interface UserCounts {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  deactivated: number;
  deleted: number;
}

export async function createUserApi(
  data: CreateUserRequest
): Promise<UserSummary> {
  const response = await api.post<UserSummary>("/api/admin/users", data);
  return response.data;
}

export async function getAllUsersApi(): Promise<UserSummary[]> {
  const response = await api.get<UserSummary[]>("/api/admin/users");
  return response.data;
}

export async function getPendingUsersApi(): Promise<UserSummary[]> {
  const response = await api.get<UserSummary[]>("/api/admin/users/pending");
  return response.data;
}

export async function getDeletedUsersApi(): Promise<UserSummary[]> {
  const response = await api.get<UserSummary[]>("/api/admin/users/deleted");
  return response.data;
}

export async function getUserCountsApi(): Promise<UserCounts> {
  const response = await api.get<UserCounts>("/api/admin/users/counts");
  return response.data;
}

export async function getUserApi(userId: string): Promise<UserSummary> {
  const response = await api.get<UserSummary>(`/api/admin/users/${userId}`);
  return response.data;
}

export async function reviewUserApi(
  userId: string,
  data: ReviewUserRequest
): Promise<{ message: string }> {
  const response = await api.post<{ success: boolean; message: string }>(
    `/api/admin/users/${userId}/review`,
    data
  );
  return response.data;
}

export async function softDeleteUserApi(
  userId: string,
  data: SoftDeleteRequest
): Promise<{ message: string }> {
  const response = await api.patch<{ success: boolean; message: string }>(
    `/api/admin/users/${userId}/soft-delete`,
    data
  );
  return response.data;
}

export async function restoreUserApi(
  userId: string
): Promise<{ message: string }> {
  const response = await api.post<{ success: boolean; message: string }>(
    `/api/admin/users/${userId}/restore`
  );
  return response.data;
}

export async function toggleUserStatusApi(
  userId: string
): Promise<{ message: string }> {
  const response = await api.patch<{ success: boolean; message: string }>(
    `/api/admin/users/${userId}/toggle-status`
  );
  return response.data;
}

export async function updateUserApi(
  userId: string,
  data: UpdateUserRequest
): Promise<UserSummary> {
  const response = await api.put<UserSummary>(
    `/api/admin/users/${userId}`,
    data
  );
  return response.data;
}

export { getErrorMessage };
