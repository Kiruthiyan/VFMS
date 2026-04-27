import axios, { AxiosError } from "axios";

import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

function resolveAccessToken(): string | null {
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) {
    return storeToken;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("vfms-auth");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      accessToken?: string;
      state?: { accessToken?: string };
    };

    return parsed.state?.accessToken ?? parsed.accessToken ?? null;
  } catch {
    return null;
  }
}

api.interceptors.request.use(
  (config) => {
    const token = resolveAccessToken();

    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default api;

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      "Something went wrong"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
