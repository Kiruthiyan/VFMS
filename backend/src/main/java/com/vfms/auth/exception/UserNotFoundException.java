package com.vfms.auth.exception;

/**
 * Exception thrown when a user is not found
 */
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }

    public UserNotFoundException(Integer userId) {
        super("User not found with ID: " + userId);
    }

    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
