package com.vfms.common.exception;

/**
 * Exception thrown when authentication fails (invalid credentials, user not found, etc.)
 * Maps to HTTP 401 Unauthorized
 */
public class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
