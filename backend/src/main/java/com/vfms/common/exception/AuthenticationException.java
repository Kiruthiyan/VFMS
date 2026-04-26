package com.vfms.common.exception;

/**
<<<<<<< HEAD
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
=======
 * Exception thrown when authentication fails.
 * Indicates invalid credentials, expired tokens, or missing authentication.
 * 
 * Typical HTTP Response: 401 Unauthorized
 */
public class AuthenticationException extends RuntimeException {
    
    /**
     * Create authentication exception with message
     * @param message Error description
     */
>>>>>>> origin/feature/user-management
    public AuthenticationException(String message) {
        super(message);
    }

<<<<<<< HEAD
<<<<<<< HEAD
    /**
     * Constructs a new AuthenticationException with a detail message and a root cause.
     *
     * @param message Human-readable description of the authentication failure
     * @param cause   The underlying exception that triggered this failure
     */
=======
>>>>>>> origin/feature/user-auth
=======
    /**
     * Create authentication exception with message and cause
     * @param message Error description
     * @param cause Root cause
     */
>>>>>>> origin/feature/user-management
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
