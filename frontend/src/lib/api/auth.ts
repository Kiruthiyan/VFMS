import axios from "axios";

import type { UserRole, UserStatus } from "@/lib/auth";
import api, { getErrorMessage as apiGetErrorMessage } from "@/lib/api";

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

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  nic: string;
  role: UserRole;
  licenseNumber?: string;
  licenseExpiryDate?: string;
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
    token?: string;
  };
}

function unwrapResponse<T>(response: ApiEnvelope<T> | T): T {
  if (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    "message" in response &&
    "data" in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
}

function unwrapSuccessResponse(
  response: ApiEnvelope<unknown> | ApiSuccessResponse
): ApiSuccessResponse {
  if (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    "message" in response
  ) {
    const envelope = response as ApiEnvelope<unknown>;
    return {
      success: envelope.success,
      message: envelope.message,
      data: envelope.data,
    };
  }

  return response as ApiSuccessResponse;
}

export async function loginApi(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await api.post<ApiEnvelope<AuthResponse>>(
    "/api/auth/login",
    data
  );
  return unwrapResponse(response.data);
}

export async function sendOTPApi(email: string): Promise<ApiSuccessResponse> {
  try {
    const response = await api.post<ApiSuccessResponse>("/api/auth/send-otp", {
      email: email.trim(),
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw error;
    }
    throw error;
  }
}

export async function verifyOTPApi(
  email: string,
  otp: string
): Promise<OTPVerificationResponse> {
  try {
    const response = await api.post<OTPVerificationResponse>(
      "/api/auth/verify-otp",
      {
        email: email.trim(),
        otp: otp.trim(),
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw error;
    }
    throw error;
  }
}

export async function signupApi(
  data: SignupRequest
): Promise<ApiSuccessResponse> {
  try {
    const sanitizedData: SignupRequest = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      fullName: data.fullName.trim(),
      phone: data.phone.trim().replace(/\s/g, ""),
      nic: data.nic.trim().replace(/\s/g, ""),
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
      confirmPassword: sanitizedData.password,
    };

    const response = await api.post<ApiEnvelope<unknown>>(
      "/api/auth/register",
      backendPayload
    );
    return unwrapSuccessResponse(response.data);
  } catch (error) {
    const errorMessage = apiGetErrorMessage(error);
    throw {
      message:
        errorMessage ||
        "Registration failed. Please check all fields and try again.",
      code: "SIGNUP_FAILED",
      originalError: error,
    };
  }
}

export async function resendVerificationApi(
  email: string
): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiEnvelope<unknown>>(
    "/api/auth/resend-verification",
    { email: email.trim() }
  );
  return unwrapSuccessResponse(response.data);
}

export async function refreshTokenApi(
  refreshToken: string
): Promise<AuthResponse> {
  const response = await api.post<ApiEnvelope<AuthResponse>>(
    "/api/auth/refresh",
    {
      refreshToken,
    }
  );
  return unwrapResponse(response.data);
}

export async function logoutApi(): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiEnvelope<unknown>>("/api/auth/logout");
  return unwrapSuccessResponse(response.data);
}

export async function getMeApi(): Promise<AuthResponse> {
  const response = await api.get<ApiEnvelope<AuthResponse>>("/api/user/me");
  return unwrapResponse(response.data);
}

export async function forgotPasswordApi(
  email: string
): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiEnvelope<unknown>>(
    "/api/auth/forgot-password",
    { email: email.trim() }
  );
  return unwrapSuccessResponse(response.data);
}

export async function resetPasswordApi(data: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiEnvelope<unknown>>(
    "/api/auth/reset-password",
    data
  );
  return unwrapSuccessResponse(response.data);
}

export async function changePasswordApi(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiSuccessResponse> {
  const response = await api.post<ApiEnvelope<unknown>>(
    "/api/user/change-password",
    data
  );
  return unwrapSuccessResponse(response.data);
}

export function getErrorMessage(error: unknown): string {
  return apiGetErrorMessage(error);
}
