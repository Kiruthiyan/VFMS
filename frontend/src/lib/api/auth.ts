import axios from "axios";

import type { UserRole, UserStatus } from "@/lib/auth";
import api, { getErrorMessage as apiGetErrorMessage } from "@/lib/api";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

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

export interface AuthErrorResponse {
  success?: boolean;
  status?: number;
  message?: string;
  errors?: Record<string, string>;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type SelfRegistrationRole = Extract<UserRole, "DRIVER" | "SYSTEM_USER">;

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  nic: string;
  requestedRole: SelfRegistrationRole;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  officeLocation?: string;
}

export class AuthApiError extends Error {
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
    this.name = "AuthApiError";
    this.status = options?.status;
    this.fieldErrors = options?.fieldErrors;
  }
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

function mapFriendlyMessage(
  status: number | undefined,
  rawMessage: string | undefined,
  fieldErrors?: Record<string, string>
): string {
  const firstFieldError = fieldErrors
    ? Object.values(fieldErrors).find((message) => message.trim().length > 0)
    : undefined;

  const message = rawMessage?.trim();
  const normalizedMessage = message?.toLowerCase() ?? "";

  if (status === 401) {
    return ERROR_MESSAGES.INVALID_CREDENTIALS;
  }

  if (
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("duplicate")
  ) {
    return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
  }

  if (normalizedMessage.includes("verify your email")) {
    return ERROR_MESSAGES.EMAIL_NOT_VERIFIED;
  }

  if (normalizedMessage.includes("pending admin approval")) {
    return ERROR_MESSAGES.ACCOUNT_PENDING;
  }

  if (
    normalizedMessage.includes("deactivated") ||
    normalizedMessage.includes("disabled")
  ) {
    return ERROR_MESSAGES.ACCOUNT_DISABLED;
  }

  if (message && message !== "Validation failed") {
    return message;
  }

  if (firstFieldError) {
    return firstFieldError;
  }

  if (status === 409) {
    return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
  }

  if (status === 403) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  if (status === 400) {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }

  return ERROR_MESSAGES.SOMETHING_WENT_WRONG;
}

function buildAuthApiError(
  error: unknown,
  fallbackMessage: string
): AuthApiError {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const data = response?.data as AuthErrorResponse | undefined;
    const fieldErrors = normalizeFieldErrors(data?.errors);

    return new AuthApiError(
      mapFriendlyMessage(response?.status, data?.message, fieldErrors) ||
        fallbackMessage,
      {
        status: response?.status,
        fieldErrors,
      }
    );
  }

  if (error instanceof Error) {
    return new AuthApiError(error.message || fallbackMessage);
  }

  return new AuthApiError(fallbackMessage);
}

export function getFieldErrors(
  error: unknown
): Record<string, string> | undefined {
  if (error instanceof AuthApiError) {
    return error.fieldErrors;
  }

  return undefined;
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
  try {
    const response = await api.post<ApiEnvelope<AuthResponse>>(
      "/api/auth/login",
      data
    );
    return unwrapResponse(response.data);
  } catch (error) {
    throw buildAuthApiError(
      error,
      "Invalid email or password. Please check your details and try again."
    );
  }
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
      confirmPassword: data.confirmPassword,
      fullName: data.fullName.trim(),
      phone: data.phone.trim().replace(/\s/g, ""),
      nic: data.nic.trim().replace(/\s/g, "").toUpperCase(),
      requestedRole: data.requestedRole,
      licenseNumber: data.licenseNumber?.trim().toUpperCase(),
      licenseExpiryDate: data.licenseExpiryDate?.trim(),
      employeeId: data.employeeId?.trim().toUpperCase(),
      department: data.department?.trim(),
      designation: data.designation?.trim(),
      officeLocation: data.officeLocation?.trim(),
    };

    const backendPayload: SignupRequest = {
      email: sanitizedData.email,
      password: sanitizedData.password,
      confirmPassword: sanitizedData.confirmPassword,
      fullName: sanitizedData.fullName,
      phone: sanitizedData.phone,
      nic: sanitizedData.nic,
      requestedRole: sanitizedData.requestedRole,
      ...(sanitizedData.requestedRole === "DRIVER"
        ? {
            licenseNumber: sanitizedData.licenseNumber,
            licenseExpiryDate: sanitizedData.licenseExpiryDate,
          }
        : {
            employeeId: sanitizedData.employeeId,
            department: sanitizedData.department,
            designation: sanitizedData.designation,
            officeLocation: sanitizedData.officeLocation,
          }),
    };

    const response = await api.post<ApiEnvelope<unknown>>(
      "/api/auth/register",
      backendPayload
    );
    return unwrapSuccessResponse(response.data);
  } catch (error) {
    throw buildAuthApiError(
      error,
      "Registration failed. Please check your details and try again."
    );
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
  if (error instanceof AuthApiError) {
    return error.message;
  }

  return apiGetErrorMessage(error);
}
