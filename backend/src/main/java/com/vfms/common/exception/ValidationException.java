package com.vfms.common.exception;

/**
<<<<<<< HEAD
<<<<<<< HEAD
 * Thrown when business logic validation fails (e.g., duplicate entries or
 * invalid fuel quantity).
 */
public class ValidationException extends RuntimeException {

    /**
     * Constructs a new ValidationException with the specified detail message.
     *
     * @param message Human-readable description of the validation failure
     *                (e.g., {@code "Quantity and costPerLitre must be set to compute total cost."})
     */
=======
 * Exception thrown when input validation fails (invalid email format, weak password, etc.)
 * Maps to HTTP 400 Bad Request
 */
public class ValidationException extends RuntimeException {
>>>>>>> origin/feature/user-auth
=======
 * Exception thrown when input validation fails.
 * Indicates invalid data format, business rule violation, or constraint failure.
 * 
 * Examples:
 * - Password doesn't meet complexity requirements
 * - Email already registered
 * - Invalid date format
 * 
 * Typical HTTP Response: 400 Bad Request
 */
public class ValidationException extends RuntimeException {
    
    /**
     * Create validation exception with message
     * @param message Error description (should explain what failed validation)
     */
>>>>>>> origin/feature/user-management
    public ValidationException(String message) {
        super(message);
    }

<<<<<<< HEAD
<<<<<<< HEAD
    /**
     * Constructs a new ValidationException with a detail message and a root cause.
     *
     * @param message Human-readable description of the validation failure
     * @param cause   The underlying exception that triggered this failure
     */
=======
>>>>>>> origin/feature/user-auth
=======
    /**
     * Create validation exception with message and cause
     * @param message Error description
     * @param cause Root cause
     */
>>>>>>> origin/feature/user-management
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
