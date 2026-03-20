import api, { getErrorMessage } from "@/lib/api";

// ── TYPES ────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "APPROVER" | "SYSTEM_USER" | "DRIVER";

export type UserStatus =
  | "EMAIL_UNVERIFIED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "DEACTIVATED";

export type RequestedRole = "DRIVER" | "SYSTEM_USER";

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  nic: string;
  password: string;
  confirmPassword: string;
  requestedRole: RequestedRole;
  // Driver fields
  licenseNumber?: string;
  licenseExpiryDate?: string;
  certifications?: string;
  experienceYears?: number | null;
  // Staff fields
  employeeId?: string;
  department?: string;
  officeLocation?: string;
  designation?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface ApiSuccessResponse {
  success: boolean;
  message: string;
  data: null;
}

// ── API CALLS ────────────────────────────────────────────────────────────

export async function registerApi(
  data: RegisterRequest
): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>(
    "/api/auth/register",
    data
  );
  return response.data;
}

export async function resendVerificationApi(
  email: string
): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>(
    "/api/auth/resend-verification",
    { email }
  );
  return response.data;
}

export { getErrorMessage };
