package com.vfms.common.exception;

/**
 * Thrown when user authentication or authorization fails.
 */
public class AuthenticationException extends RuntimeException {

    /**
     * Constructs a new AuthenticationException with the specified detail message.
     *
     * @param message Human-readable description of the authentication failure
     *                (e.g., {@code "Invalid or expired JWT token"})
     */
    public AuthenticationException(String message) {
        super(message);
    }

    /**
     * Constructs a new AuthenticationException with a detail message and a root cause.
     *
     * @param message Human-readable description of the authentication failure
     * @param cause   The underlying exception that triggered this failure
     */
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
