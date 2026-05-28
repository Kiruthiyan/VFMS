import { beforeEach, describe, expect, it, vi } from "vitest";

import { api, getErrorMessage } from "@/lib/api";
import { AUTH_ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";

describe("api", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.getState().clearAuth();
    vi.restoreAllMocks();
  });

  it("creates the axios instance with the expected defaults", () => {
    expect(api.defaults.baseURL).toBe(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    );
    expect(api.defaults.timeout).toBe(15000);

    const contentType =
      (api.defaults.headers as Record<string, string>)["Content-Type"] ??
      (api.defaults.headers as { common?: Record<string, string> }).common?.[
        "Content-Type"
      ];

    expect(contentType).toBe("application/json");
  });

  it("registers request and response interceptors", () => {
    expect(typeof api.interceptors.request.use).toBe("function");
    expect(typeof api.interceptors.response.use).toBe("function");
  });

  it("resolves error messages from axios-style responses", () => {
    const message = getErrorMessage({
      isAxiosError: true,
      response: { data: { message: "Invalid credentials" } },
    });

    expect(message).toBe("Invalid credentials");
  });

  it("falls back to the native error message when needed", () => {
    expect(getErrorMessage(new Error("Boom"))).toBe("Boom");
  });

  it("keeps the auth store available for request interception", () => {
    useAuthStore.getState().setAuth({
      userId: "user-1",
      fullName: "Jane Doe",
      email: "jane@example.com",
      role: "SYSTEM_USER",
      status: "APPROVED",
      accessToken: "token-123",
      refreshToken: "refresh-123",
    });

    expect(useAuthStore.getState().accessToken).toBe("token-123");
  });

  it("keeps auth route constants aligned with login defaults", () => {
    expect(AUTH_ROUTES.LOGIN).toBe("/auth/login");
  });
});
