package com.vfms.common.exception;

/**
 * Exception thrown when input validation fails (invalid email format, weak password, etc.)
 * Maps to HTTP 400 Bad Request
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
