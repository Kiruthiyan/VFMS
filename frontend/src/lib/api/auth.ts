import api, { getErrorMessage as apiGetErrorMessage } from "@/lib/api";
import axios from "axios";

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

// Signup registration data
export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  nic: string;
  role: UserRole;
  // DRIVER specific fields
  licenseNumber?: string;
  licenseExpiryDate?: string;
  // SYSTEM_USER specific fields
  employeeId?: string;
  department?: string;
  designation?: string;
  officeLocation?: string;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface OTPVerificationResponse extends ApiSuccessResponse {
  data?: {
    verified: boolean;
    token?: string; // Temporary token for registration
  };
}

// LOGIN API
export async function loginApi(data: { email: string; password: string }): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/login", data);
  return response.data;
}

// SIGNUP API - Send OTP to email
export async function sendOTPApi(email: string): Promise<ApiSuccessResponse> {
  try {
    const response = await api.post<ApiSuccessResponse>("/api/auth/send-otp", { email: email.trim() });
    return response.data;
  } catch (error) {
    throw {
      message: "Failed to send verification code. Please check your email address.",
      code: "SEND_OTP_FAILED",
      originalError: error,
    };
  }
}

// SIGNUP API - Verify OTP
export async function verifyOTPApi(email: string, otp: string): Promise<OTPVerificationResponse> {
  try {
    const response = await api.post<OTPVerificationResponse>("/api/auth/verify-otp", {
      email: email.trim(),
      otp: otp.trim(),
    });
    return response.data;
  } catch (error: unknown) {
    // Preserve the actual backend error message with error codes like [INVALID_OTP], [OTP_EXPIRED], [NO_OTP]
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      // Re-throw with the actual backend error message to preserve error codes
      throw error; // Let the caller handle the axios error directly
    }
    // Fallback for non-axios errors
    throw error;
  }
}

// SIGNUP API - Complete registration
export async function signupApi(data: SignupRequest): Promise<AuthResponse> {
  try {
    // Sanitize and trim all string fields
    const sanitizedData: SignupRequest = {
      email: data.email.trim().toLowerCase(),
      password: data.password, // Don't trim password (user might want spaces)
      fullName: data.fullName.trim(),
      phone: data.phone.trim().replace(/\s/g, ""), // Remove all whitespace from phone
      nic: data.nic.trim().replace(/\s/g, ""), // Remove whitespace from NIC
      role: data.role,
      licenseNumber: data.licenseNumber?.trim().toUpperCase(),
      licenseExpiryDate: data.licenseExpiryDate?.trim(),
      employeeId: data.employeeId?.trim().toUpperCase(),
      department: data.department?.trim(),
      designation: data.designation?.trim(),
      officeLocation: data.officeLocation?.trim(),
    };

    const backendPayload = {
      ...sanitizedData,
      requestedRole: sanitizedData.role,
      confirmPassword: sanitizedData.password
    };

    const response = await api.post<AuthResponse>("/api/auth/register", backendPayload);
    return response.data;
  } catch (error) {
    const errorMessage = apiGetErrorMessage(error);
    throw {
      message: errorMessage || "Registration failed. Please check all fields and try again.",
      code: "SIGNUP_FAILED",
      originalError: error,
    };
  }
}

// RESEND VERIFICATION
export async function resendVerificationApi(email: string): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>(
    "/api/auth/resend-verification",
    { email: email.trim() }
  );
  return response.data;
}

// TOKEN REFRESH
export async function refreshTokenApi(refreshToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/refresh", {
    refreshToken,
  });
  return response.data;
}

// LOGOUT
export async function logoutApi(): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiSuccessResponse>("/api/auth/logout");
  return response.data;
}

// GET CURRENT USER
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
