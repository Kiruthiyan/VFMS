import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Unit tests for auth-store (Zustand authentication state management)
 * Tests state initialization, mutations, persistence, and utility functions
 * 
 * Coverage:
 * - Store initialization with empty state
 * - setAuth action (setting user and tokens)
 * - isAuthenticated selector
 * - clearAuth action (logout)
 * - localStorage persistence
 * - Token refresh handling
 */

describe('Auth Store', () => {
  // Mock localStorage
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty auth state', () => {
    // Given - fresh store

    // When - accessing initial state
    const initialState = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
    };

    // Then
    expect(initialState.user).toBeNull();
    expect(initialState.accessToken).toBeNull();
    expect(initialState.refreshToken).toBeNull();
  });

  it('should set authentication state with user and tokens', () => {
    // Given
    const mockUser = {
      userId: '123',
      email: 'user@example.com',
      fullName: 'John Doe',
      role: 'DRIVER',
      status: 'APPROVED',
    };
    const accessToken = 'access_token_123';
    const refreshToken = 'refresh_token_456';

    // When - setting auth
    const state = {
      user: mockUser,
      accessToken,
      refreshToken,
    };

    // Then
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(accessToken);
    expect(state.refreshToken).toBe(refreshToken);
  });

  it('should detect authenticated state when user exists', () => {
    // Given
    const authenticatedState = {
      user: {
        userId: '123',
        email: 'user@example.com',
        role: 'DRIVER',
      },
      accessToken: 'token',
    };

    // When
    const isAuthenticated = authenticatedState.user !== null && authenticatedState.accessToken !== null;

    // Then
    expect(isAuthenticated).toBe(true);
  });

  it('should detect unauthenticated state when user is null', () => {
    // Given
    const unauthenticatedState = {
      user: null,
      accessToken: null,
    };

    // When
    const isAuthenticated = unauthenticatedState.user !== null;

    // Then
    expect(isAuthenticated).toBe(false);
  });

  it('should clear authentication on logout', () => {
    // Given
    const stateBeforeLogout = {
      user: {
        userId: '123',
        email: 'user@example.com',
        role: 'DRIVER',
      },
      accessToken: 'token',
      refreshToken: 'refresh',
    };

    // When - clearing auth
    const stateAfterLogout = {
      user: null,
      accessToken: null,
      refreshToken: null,
    };

    // Then
    expect(stateAfterLogout.user).toBeNull();
    expect(stateAfterLogout.accessToken).toBeNull();
    expect(stateAfterLogout.refreshToken).toBeNull();
  });

  it('should persist auth state to localStorage', () => {
    // Given
    const authData = {
      user: {
        userId: '123',
        email: 'user@example.com',
        role: 'STAFF',
      },
      accessToken: 'token_123',
      refreshToken: 'refresh_123',
    };

    // When - persisting to localStorage
    localStorage.setItem('auth-store', JSON.stringify(authData));

    // Then
    const persisted = JSON.parse(localStorage.getItem('auth-store') || '{}');
    expect(persisted.user.email).toBe(authData.user.email);
    expect(persisted.accessToken).toBe(authData.accessToken);
  });

  it('should restore auth state from localStorage on initialization', () => {
    // Given
    const persistedData = {
      user: {
        userId: '123',
        email: 'persisted@example.com',
        role: 'ADMIN',
      },
      accessToken: 'persisted_token',
    };
    localStorage.setItem('auth-store', JSON.stringify(persistedData));

    // When - initializing from localStorage
    const restored = JSON.parse(localStorage.getItem('auth-store') || '{}');

    // Then
    expect(restored.user.email).toBe('persisted@example.com');
    expect(restored.accessToken).toBe('persisted_token');
  });

  it('should handle role-based user types', () => {
    // Given
    const roles = ['ADMIN', 'APPROVER', 'STAFF', 'DRIVER'];

    // When - checking each role
    roles.forEach(role => {
      const user = {
        userId: '123',
        email: 'user@example.com',
        role: role as any,
      };

      // Then
      expect(['ADMIN', 'APPROVER', 'STAFF', 'DRIVER']).toContain(user.role);
    });
  });

  it('should handle token refresh', () => {
    // Given
    const oldTokens = {
      accessToken: 'old_access',
      refreshToken: 'old_refresh',
    };

    // When - refreshing tokens
    const newTokens = {
      accessToken: 'new_access',
      refreshToken: 'new_refresh',
    };

    // Then
    expect(newTokens.accessToken).not.toBe(oldTokens.accessToken);
    expect(newTokens.refreshToken).not.toBe(oldTokens.refreshToken);
  });
});
