package com.vfms.common.exception;

/**
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
    public ValidationException(String message) {
        super(message);
    }

    /**
     * Constructs a new ValidationException with a detail message and a root cause.
     *
     * @param message Human-readable description of the validation failure
     * @param cause   The underlying exception that triggered this failure
     */
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
