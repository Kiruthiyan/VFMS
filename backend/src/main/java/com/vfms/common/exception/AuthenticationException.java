package com.vfms.common.exception;

/**
<<<<<<< HEAD
 * Thrown when user authentication or authorization fails.
 */
public class AuthenticationException extends RuntimeException {

    /**
     * Constructs a new AuthenticationException with the specified detail message.
     *
     * @param message Human-readable description of the authentication failure
     *                (e.g., {@code "Invalid or expired JWT token"})
     */
=======
 * Exception thrown when authentication fails (invalid credentials, user not found, etc.)
 * Maps to HTTP 401 Unauthorized
 */
public class AuthenticationException extends RuntimeException {
>>>>>>> origin/feature/user-auth
    public AuthenticationException(String message) {
        super(message);
    }

<<<<<<< HEAD
    /**
     * Constructs a new AuthenticationException with a detail message and a root cause.
     *
     * @param message Human-readable description of the authentication failure
     * @param cause   The underlying exception that triggered this failure
     */
=======
>>>>>>> origin/feature/user-auth
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
