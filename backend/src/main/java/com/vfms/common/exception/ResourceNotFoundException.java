package com.vfms.common.exception;

/**
<<<<<<< HEAD
 * Thrown when an requested resource (e.g., Vehicle, Driver, FuelRecord) is not
 * found in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new ResourceNotFoundException with the specified detail message.
     *
     * @param message Human-readable description of the missing resource
     *                (e.g., {@code "Vehicle not found: <id>"})
     */
=======
 * Exception thrown when a requested resource is not found
 * Maps to HTTP 404 Not Found
 */
public class ResourceNotFoundException extends RuntimeException {
>>>>>>> origin/feature/user-auth
    public ResourceNotFoundException(String message) {
        super(message);
    }

<<<<<<< HEAD
    /**
     * Constructs a new ResourceNotFoundException with a detail message and a root cause.
     *
     * @param message Human-readable description of the missing resource
     * @param cause   The underlying exception that triggered this failure
     */
=======
>>>>>>> origin/feature/user-auth
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
