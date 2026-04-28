import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Keep the interceptor in place so auth headers can be added centrally when login is wired up.
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// A shared 401 handler keeps the redirect behavior consistent across all API calls.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    // Translate fetch-style options into the axios request shape used by the app.
    const method = options?.method ?? "GET";
    const headers = options?.headers as Record<string, string> | undefined;

    let data: unknown = undefined;
    if (options?.body) {
      // Preserve JSON payloads when the caller passes a serialized request body.
      try {
        data = JSON.parse(options.body as string);
      } catch {
        data = options.body;
      }
    }

    const response = await api.request<T>({
      url: path,
      method,
      headers,
      data,
    } as AxiosRequestConfig);

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// Normalize axios and generic errors into a single message for toasts and inline validation.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string })?.message ??
      error.message ??
      "Something went wrong"
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}