import api, { getErrorMessage as apiGetErrorMessage } from "@/lib/api";

export type UserRole = "ADMIN" | "APPROVER" | "SYSTEM_USER" | "DRIVER";
export type UserStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export interface AuthResponse {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  accessToken: string;
  refreshToken: string;
}

export interface ApiSuccessResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function loginApi(data: { email: string; password: string }): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/login", data);
  return response.data;
}

export async function resendVerificationApi(email: string): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>(
    "/api/auth/resend-verification",
    { email }
  );
  return response.data;
}

export async function refreshTokenApi(refreshToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/refresh", {
    refreshToken,
  });
  return response.data;
}

export async function logoutApi(): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>("/api/auth/logout");
  return response.data;
}

export async function getMeApi(): Promise<AuthResponse> {
  const response = await api.get<AuthResponse>("/api/user/me");
  return response.data;
}

export function getErrorMessage(error: unknown): string {
  return apiGetErrorMessage(error);
}

// ─── PASSWORD MANAGEMENT ──────────────────────────────────────────

export async function forgotPasswordApi(
  email: string
): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>(
    "/api/auth/forgot-password",
    { email }
  );
  return response.data;
}

export async function verifyPasswordResetOtpApi(
  email: string,
  otp: string
): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>(
    "/api/auth/verify-password-reset-otp",
    { email, otp }
  );
  return response.data;
}

export async function resetPasswordApi(data: {
  email?: string;
  otp?: string;
  token?: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>(
    "/api/auth/reset-password",
    data
  );
  return response.data;
}

export async function changePasswordApi(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>(
    "/api/user/change-password",
    data
  );
  return response.data;
}
