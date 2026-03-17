package com.vfms.auth.exception;

/**
 * Exception thrown when password does not meet complexity requirements
 */
public class PasswordComplexityException extends RuntimeException {
    public PasswordComplexityException(String message) {
        super(message);
    }

    public PasswordComplexityException(String message, Throwable cause) {
        super(message, cause);
    }
}
