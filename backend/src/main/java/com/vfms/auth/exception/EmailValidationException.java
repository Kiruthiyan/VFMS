package com.vfms.auth.exception;

/**
 * Exception thrown when email validation fails or email already exists
 */
public class EmailValidationException extends RuntimeException {
    public EmailValidationException(String message) {
        super(message);
    }

    public EmailValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
