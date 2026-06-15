import { beforeEach, describe, expect, it, vi } from "vitest";

const getMeApiMock = vi.fn();

vi.mock("@/lib/api/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/auth")>(
    "@/lib/api/auth"
  );

  return {
    ...actual,
    getMeApi: (...args: Parameters<typeof actual.getMeApi>) =>
      getMeApiMock(...args),
  };
});

describe("useAuthStore", () => {
  beforeEach(async () => {
    vi.resetModules();
    window.localStorage.clear();
    getMeApiMock.mockReset();

    const { useAuthStore } = await import("@/store/auth-store");
    useAuthStore.getState().clearAuth();
  });

  async function getStore() {
    const { useAuthStore } = await import("@/store/auth-store");
    return useAuthStore;
  }

  it("initializes with an empty auth state", async () => {
    const useAuthStore = await getStore();
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });

  it("stores auth data correctly", async () => {
    const useAuthStore = await getStore();
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

  it("returns false for users who are not approved", async () => {
    const useAuthStore = await getStore();
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

  it("clears auth data correctly", async () => {
    const useAuthStore = await getStore();
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

  it("syncSessionFromServer keeps session when profile sync succeeds", async () => {
    const useAuthStore = await getStore();
    useAuthStore.getState().setAuth({
      userId: "user123",
      fullName: "John Doe",
      email: "john@example.com",
      role: "ADMIN",
      status: "APPROVED",
      accessToken: "jwt_token_123",
      refreshToken: "refresh_token_123",
    });

    getMeApiMock.mockResolvedValue({
      userId: "user123",
      fullName: "John Doe",
      email: "john@example.com",
      role: "SYSTEM_USER",
      status: "APPROVED",
    });

    await useAuthStore.getState().syncSessionFromServer();

    const state = useAuthStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.accessToken).toBe("jwt_token_123");
    expect(state.user?.role).toBe("SYSTEM_USER");
    expect(state.isAuthenticated()).toBe(true);
    expect(getMeApiMock).toHaveBeenCalledOnce();
  });

  it("syncSessionFromServer clears session on 401", async () => {
    const { AuthApiError } = await import("@/lib/api/auth");
    const useAuthStore = await getStore();
    useAuthStore.getState().setAuth({
      userId: "user123",
      fullName: "John Doe",
      email: "john@example.com",
      role: "ADMIN",
      status: "APPROVED",
      accessToken: "jwt_token_123",
      refreshToken: "refresh_token_123",
    });

    getMeApiMock.mockRejectedValue(
      new AuthApiError("Unauthorized", { status: 401 })
    );

    await useAuthStore.getState().syncSessionFromServer();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.hydrated).toBe(true);
  });
});
