import api, { getErrorMessage } from "@/lib/api";
import type { UserRole, UserStatus } from "@/lib/auth";

// ── TYPES ─────────────────────────────────────────────────────────────────

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
  reviewedAt: string | null;
  rejectionReason: string | null;
  // Driver
  licenseNumber: string | null;
  licenseExpiryDate: string | null;
  certifications: string | null;
  experienceYears: number | null;
  // Staff
  employeeId: string | null;
  department: string | null;
  officeLocation: string | null;
  designation: string | null;
  approvalLevel: string | null;
}

export interface ReviewUserRequest {
  decision: "APPROVE" | "REJECT";
  assignedRole?: UserRole;
  rejectionReason?: string;
}

export interface UpdateUserRequest {
  phone?: string;
  department?: string;
  officeLocation?: string;
  designation?: string;
  approvalLevel?: string;
  role?: UserRole;
}

// ── API CALLS ─────────────────────────────────────────────────────────────

export async function getAllUsersApi(): Promise<UserSummary[]> {
  const response = await api.get<UserSummary[]>("/api/admin/users");
  return response.data;
}

export async function getPendingUsersApi(): Promise<UserSummary[]> {
  const response = await api.get<UserSummary[]>("/api/admin/users/pending");
  return response.data;
}

export async function getUserApi(userId: string): Promise<UserSummary> {
  const response = await api.get<UserSummary>(
    `/api/admin/users/${userId}`
  );
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
