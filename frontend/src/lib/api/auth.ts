import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "APPROVER" | "SYSTEM_USER" | "DRIVER";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/login", data);
  return response.data;
}

export async function refreshApi(refreshToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/refresh", { refreshToken });
  return response.data;
}

export async function logoutApi(accessToken: string): Promise<void> {
  await api.post("/api/auth/logout", {}, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}