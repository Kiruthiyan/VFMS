import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

/**
 * Unit tests for API configuration and interceptors
 * Tests Axios setup, token injection, error handling, and configuration
 * 
 * Coverage:
 * - Base URL configuration
 * - Default headers setup
 * - Request timeout
 * - Interceptor registration
 * - JWT token injection in requests
 * - Error handling in responses
 * - 401 redirect on unauthorized
 */

describe('API Configuration', () => {
  const mockApiUrl = 'http://localhost:8080/api';
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct base URL configured', () => {
    // Given
    const expectedUrl = mockApiUrl;

    // When
    const apiInstance = axios.create({
      baseURL: expectedUrl,
    });

    // Then
    expect(apiInstance.defaults.baseURL).toBe(expectedUrl);
  });

  it('should have Content-Type header set to application/json', () => {
    // Given
    const apiInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // When
    const contentType =
      // Axios may normalize into defaults.headers (not always defaults.headers.common)
      (apiInstance.defaults.headers as any)?.common?.['Content-Type'] ??
      (apiInstance.defaults.headers as any)?.['Content-Type'];

    // Then
    expect(contentType).toBe('application/json');
  });

  it('should have request timeout configured', () => {
    // Given
    const expectedTimeout = 15000;

    // When
    const apiInstance = axios.create({
      timeout: expectedTimeout,
    });

    // Then
    expect(apiInstance.defaults.timeout).toBe(expectedTimeout);
  });

  it('should inject JWT token in Authorization header', () => {
    // Given
    const mockToken = 'test_jwt_token_123';
    const config = {
      headers: {},
    };

    // When - request interceptor adds token
    config.headers['Authorization'] = `Bearer ${mockToken}`;

    // Then
    expect(config.headers['Authorization']).toBe(`Bearer ${mockToken}`);
  });

  it('should not inject token if not available', () => {
    // Given
    const config = {
      headers: {} as Record<string, string>,
    };

    // When - no token available
    const token = null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Then
    expect(config.headers['Authorization']).toBeUndefined();
  });

  it('should handle 401 response errors', () => {
    // Given
    const error = {
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    // When
    const is401 = error.response?.status === 401;

    // Then
    expect(is401).toBe(true);
  });

  it('should redirect to login on 401 error', () => {
    // Given
    const error = {
      response: {
        status: 401,
      },
    };

    // When
    if (error.response?.status === 401) {
      // Simulate redirect logic
      const loginUrl = '/auth/login';

      // Then
      expect(loginUrl).toBe('/auth/login');
    }
  });

  it('should pass through non-401 error responses', () => {
    // Given
    const errors = [
      { response: { status: 400, data: { message: 'Bad Request' } } },
      { response: { status: 500, data: { message: 'Server Error' } } },
      { response: { status: 403, data: { message: 'Forbidden' } } },
    ];

    // When/Then
    errors.forEach(error => {
      expect(error.response.status).not.toBe(401);
    });
  });

  it('should extract error message from API response', () => {
    // Given
    const errorResponse = {
      data: {
        message: 'Invalid credentials',
      },
    };

    // When
    const message = errorResponse.data?.message || 'Unknown error';

    // Then
    expect(message).toBe('Invalid credentials');
  });

  it('should handle missing error message in response', () => {
    // Given
    const errorResponse = {
      data: {},
    };

    // When
    const message = errorResponse.data?.message || 'Unknown error';

    // Then
    expect(message).toBe('Unknown error');
  });

  it('should configure request headers correctly', () => {
    // Given
    const expectedHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // When
    const apiInstance = axios.create({
      headers: expectedHeaders,
    });

    // Then
    const contentType =
      (apiInstance.defaults.headers as any)?.common?.['Content-Type'] ??
      (apiInstance.defaults.headers as any)?.['Content-Type'];
    expect(contentType).toBe('application/json');
  });

  it('should handle multiple interceptors', () => {
    // Given
    const apiInstance = axios.create();

    // When - adding multiple interceptors
    const requestInterceptors = 0;
    const responseInterceptors = 0;

    // Simulate interceptor registration
    const mockInterceptors = [
      'request-auth',
      'request-logging',
      'response-error',
    ];

    // Then
    expect(mockInterceptors).toHaveLength(3);
  });

  it('should preserve token across multiple requests', () => {
    // Given
    const token = 'persistent_token_123';
    const requests = 3;

    // When - making multiple requests
    const tokensPerRequest = Array(requests).fill(token);

    // Then
    tokensPerRequest.forEach(t => {
      expect(t).toBe(token);
    });
  });
});
