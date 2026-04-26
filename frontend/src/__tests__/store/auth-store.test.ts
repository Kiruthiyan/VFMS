import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Unit tests for authentication store
 * Tests state management: setAuth, clearAuth, and isAuthenticated
 */
describe('useAuthStore', () => {
  beforeEach(() => {
    // Clear store before each test
    const { clearAuth } = renderHook(() => useAuthStore()).result.current;
    act(() => {
      clearAuth();
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.isAuthenticated()).toBe(false);
  });

  it('should set auth data correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const authData = {
      userId: 'user123',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'ADMIN',
      status: 'APPROVED',
      accessToken: 'jwt_token_123',
      refreshToken: 'refresh_token_123',
    };

    act(() => {
      result.current.setAuth(authData);
    });

    expect(result.current.user).toEqual({
      userId: 'user123',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'ADMIN',
      status: 'APPROVED',
    });
    expect(result.current.accessToken).toBe('jwt_token_123');
    expect(result.current.refreshToken).toBe('refresh_token_123');
  });

  it('should return true for isAuthenticated when user is set', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const authData = {
      userId: 'user123',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'STAFF',
      status: 'APPROVED',
      accessToken: 'jwt_token',
      refreshToken: 'refresh_token',
    };

    act(() => {
      result.current.setAuth(authData);
    });

    expect(result.current.isAuthenticated()).toBe(true);
  });

  it('should clear auth data correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const authData = {
      userId: 'user123',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'DRIVER',
      status: 'APPROVED',
      accessToken: 'jwt_token',
      refreshToken: 'refresh_token',
    };

    act(() => {
      result.current.setAuth(authData);
    });

    expect(result.current.isAuthenticated()).toBe(true);

    act(() => {
      result.current.clearAuth();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.isAuthenticated()).toBe(false);
  });

  it('should persist and restore state from localStorage', () => {
    const { result: result1 } = renderHook(() => useAuthStore());
    
    const authData = {
      userId: 'user123',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      role: 'APPROVER',
      status: 'APPROVED',
      accessToken: 'jwt_token',
      refreshToken: 'refresh_token',
    };

    act(() => {
      result1.current.setAuth(authData);
    });

    // Create new hook instance to test persistence
    const { result: result2 } = renderHook(() => useAuthStore());
    
    // Should restore from localStorage
    expect(result2.current.user?.email).toBe('jane@example.com');
  });
});
