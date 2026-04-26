package com.vfms.common.exception;

/**
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
    public AuthenticationException(String message) {
        super(message);
    }

    /**
     * Create authentication exception with message and cause
     * @param message Error description
     * @param cause Root cause
     */
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
