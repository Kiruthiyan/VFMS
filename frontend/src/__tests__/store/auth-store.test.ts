import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/store/auth-store";

describe("useAuthStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.getState().clearAuth();
  });

  it("initializes with an empty auth state", () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });

  it("stores auth data correctly", () => {
    useAuthStore.getState().setAuth({
      userId: "user123",
      fullName: "John Doe",
      email: "john@example.com",
      role: "ADMIN",
      status: "APPROVED",
      accessToken: "jwt_token_123",
      refreshToken: "refresh_token_123",
    });

    const state = useAuthStore.getState();

    expect(state.user).toEqual({
      userId: "user123",
      fullName: "John Doe",
      email: "john@example.com",
      role: "ADMIN",
      status: "APPROVED",
    });
    expect(state.accessToken).toBe("jwt_token_123");
    expect(state.refreshToken).toBe("refresh_token_123");
    expect(state.isAuthenticated()).toBe(true);
  });

  it("returns false for users who are not approved", () => {
    useAuthStore.getState().setAuth({
      userId: "user123",
      fullName: "Pending User",
      email: "pending@example.com",
      role: "SYSTEM_USER",
      status: "PENDING_APPROVAL",
      accessToken: "jwt_token",
      refreshToken: "refresh_token",
    });

    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("clears auth data correctly", () => {
    useAuthStore.getState().setAuth({
      userId: "user123",
      fullName: "John Doe",
      email: "john@example.com",
      role: "DRIVER",
      status: "APPROVED",
      accessToken: "jwt_token",
      refreshToken: "refresh_token",
    });

    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });
});
