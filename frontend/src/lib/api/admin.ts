import axios from "axios";

import api, { getErrorMessage as apiGetErrorMessage } from "@/lib/api";
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

interface AdminErrorResponse {
  status?: number;
  message?: string;
  errors?: Record<string, string>;
}

export class AdminApiError extends Error {
  status?: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    options?: {
      status?: number;
      fieldErrors?: Record<string, string>;
    }
  ) {
    super(message);
    this.name = "AdminApiError";
    this.status = options?.status;
    this.fieldErrors = options?.fieldErrors;
  }
}

function normalizeFieldErrors(
  errors: unknown
): Record<string, string> | undefined {
  if (!errors || typeof errors !== "object") {
    return undefined;
  }

  const entries = Object.entries(errors).filter(
    ([, value]) => typeof value === "string" && value.trim().length > 0
  ) as Array<[string, string]>;

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

function buildAdminApiError(
  error: unknown,
  fallbackMessage: string
): AdminApiError {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const data = response?.data as AdminErrorResponse | undefined;
    const fieldErrors = normalizeFieldErrors(data?.errors);
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors).find((message) => message.trim().length > 0)
      : undefined;
    const message =
      data?.message?.trim() &&
      data.message.trim() !== "Validation failed"
        ? data.message.trim()
        : firstFieldError || fallbackMessage;

    return new AdminApiError(message, {
      status: response?.status,
      fieldErrors,
    });
  }

  if (error instanceof Error) {
    return new AdminApiError(error.message || fallbackMessage);
  }

  return new AdminApiError(fallbackMessage);
}

export function getFieldErrors(
  error: unknown
): Record<string, string> | undefined {
  if (error instanceof AdminApiError) {
    return error.fieldErrors;
  }

  return undefined;
}

export async function createUserApi(
  data: CreateUserRequest
): Promise<UserSummary> {
  try {
    const payload: CreateUserRequest = {
      ...data,
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      phone: data.phone?.trim(),
      nic: data.nic.trim().toUpperCase(),
      licenseNumber: data.licenseNumber?.trim().toUpperCase(),
      licenseExpiryDate: data.licenseExpiryDate?.trim(),
      certifications: data.certifications?.trim(),
      employeeId: data.employeeId?.trim().toUpperCase(),
      department: data.department?.trim(),
      officeLocation: data.officeLocation?.trim(),
      designation: data.designation?.trim(),
      approvalLevel: data.approvalLevel?.trim(),
    };

    const response = await api.post<UserSummary>("/api/admin/users", payload);
    return response.data;
  } catch (error) {
    throw buildAdminApiError(
      error,
      "Failed to create user. Please check the form and try again."
    );
  }
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
  try {
    const response = await api.post<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}/review`,
      data
    );
    return response.data;
  } catch (error) {
    throw buildAdminApiError(
      error,
      "Failed to review user. Please try again."
    );
  }
}

export async function softDeleteUserApi(
  userId: string,
  data: SoftDeleteRequest
): Promise<{ message: string }> {
  try {
    const response = await api.patch<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}/soft-delete`,
      data
    );
    return response.data;
  } catch (error) {
    throw buildAdminApiError(
      error,
      "Failed to delete user. Please try again."
    );
  }
}

export async function restoreUserApi(
  userId: string
): Promise<{ message: string }> {
  try {
    const response = await api.post<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}/restore`
    );
    return response.data;
  } catch (error) {
    throw buildAdminApiError(
      error,
      "Failed to restore user. Please try again."
    );
  }
}

export async function toggleUserStatusApi(
  userId: string
): Promise<{ message: string }> {
  try {
    const response = await api.patch<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}/toggle-status`
    );
    return response.data;
  } catch (error) {
    throw buildAdminApiError(
      error,
      "Failed to update user status. Please try again."
    );
  }
}

export async function updateUserApi(
  userId: string,
  data: UpdateUserRequest
): Promise<UserSummary> {
  try {
    const payload: UpdateUserRequest = {
      ...data,
      fullName: data.fullName?.trim(),
      email: data.email?.trim().toLowerCase(),
      phone: data.phone?.trim(),
      nic: data.nic?.trim().toUpperCase(),
      licenseNumber: data.licenseNumber?.trim().toUpperCase(),
      licenseExpiryDate: data.licenseExpiryDate?.trim(),
      certifications: data.certifications?.trim(),
      employeeId: data.employeeId?.trim().toUpperCase(),
      department: data.department?.trim(),
      officeLocation: data.officeLocation?.trim(),
      designation: data.designation?.trim(),
      approvalLevel: data.approvalLevel?.trim(),
    };

    const response = await api.put<UserSummary>(
      `/api/admin/users/${userId}`,
      payload
    );
    return response.data;
  } catch (error) {
    throw buildAdminApiError(
      error,
      "Failed to update user. Please check the form and try again."
    );
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AdminApiError) {
    return error.message;
  }

  return apiGetErrorMessage(error);
}
