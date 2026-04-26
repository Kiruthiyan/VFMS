package com.vfms.common.exception;

/**
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
    public ValidationException(String message) {
        super(message);
    }

    /**
     * Create validation exception with message and cause
     * @param message Error description
     * @param cause Root cause
     */
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
