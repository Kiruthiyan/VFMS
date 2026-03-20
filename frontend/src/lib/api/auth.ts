import api from "@/lib/api";
import axios, { AxiosError } from "axios";

// ── TYPES ─────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "APPROVER" | "SYSTEM_USER" | "DRIVER";

export type UserStatus =
  | "EMAIL_UNVERIFIED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "DEACTIVATED";

export interface RegisterRequest {
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  nic: string;
  password: string;
  confirmPassword?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  certifications?: string;
  experienceYears?: number;
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

export interface ApiSuccessResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ── API FUNCTIONS ──────────────────────────────────────────────────────────

export async function registerApi(data: RegisterRequest): Promise<void> {
  await api.post<ApiSuccessResponse>("/api/auth/register", data);
}

export async function resendVerificationApi(email: string): Promise<void> {
  await api.post<ApiSuccessResponse>("/api/auth/resend-verification", {
    email,
  });
}

export async function loginApi(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await api.post<ApiSuccessResponse<AuthResponse>>(
    "/api/auth/login",
    { email, password }
  );
  return response.data.data;
}

export async function refreshTokenApi(): Promise<AuthResponse> {
  const response = await api.post<ApiSuccessResponse<AuthResponse>>(
    "/api/auth/refresh"
  );
  return response.data.data;
}

export async function logoutApi(): Promise<void> {
  await api.post<ApiSuccessResponse>("/api/auth/logout");
}

export async function getMeApi(): Promise<AuthResponse> {
  const response = await api.get<ApiSuccessResponse<AuthResponse>>(
    "/api/auth/me"
  );
  return response.data.data;
}

// ── ERROR HANDLING ───────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Handle API error response
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    // Handle validation errors
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      return Object.values(errors)
        .flat()
        .join(", ");
    }

    // Handle network errors
    if (axiosError.code === "ERR_NETWORK") {
      return "Network error. Please check your connection.";
    }

    if (axiosError.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
