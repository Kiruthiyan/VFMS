package com.vfms.common.exception;

/**
 * Exception thrown when a requested resource cannot be found.
 * Typical HTTP mapping: 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
