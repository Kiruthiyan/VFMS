package com.vfms.common.exception;

import com.vfms.common.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
<<<<<<< HEAD
<<<<<<< HEAD
 * Global exception handler for REST API endpoints.
 * Maps application exceptions to consistent HTTP responses.
 * 
 * This class ensures that all potential runtime failures are caught
 * and transformed into a standardized ErrorResponse object.
=======
 * Global exception handler for REST API endpoints
 * Maps custom exceptions to appropriate HTTP status codes
 * Provides consistent error response format across the application
>>>>>>> origin/feature/user-auth
=======
 * Global exception handler for REST API endpoints.
 * Maps application exceptions to consistent HTTP responses.
>>>>>>> origin/feature/user-management
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

<<<<<<< HEAD
    /**
<<<<<<< HEAD
     * Handles custom AuthenticationException.
     * Triggered when JWT or Login verification fails.
     * 
     * @param ex The thrown exception
     * @return 401 Unauthorized with detailed message
=======
     * Handles authentication exceptions (invalid credentials, user not found)
     * Returns HTTP 401 Unauthorized
>>>>>>> origin/feature/user-auth
     */
=======
>>>>>>> origin/feature/user-management
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
<<<<<<< HEAD
<<<<<<< HEAD
                ErrorResponse.builder().status(401).message(ex.getMessage()).build());
    }

    /**
     * Handles custom ValidationException for business logic rules.
     * 
     * @param ex The validation error details
     * @return 400 Bad Request
=======
                ErrorResponse.builder()
                        .status(401)
                        .message(ex.getMessage())
                        .build()
        );
    }

    /**
     * Handles validation exceptions (invalid input, business rule violations)
     * Returns HTTP 400 Bad Request
>>>>>>> origin/feature/user-auth
     */
=======
                ErrorResponse.builder().status(401).message(ex.getMessage()).build()
        );
    }

>>>>>>> origin/feature/user-management
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        log.warn("Validation failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
<<<<<<< HEAD
<<<<<<< HEAD
                ErrorResponse.builder().status(400).message(ex.getMessage()).build());
    }

    /**
     * Handles ResourceNotFoundException when database lookups fail.
     * 
     * @param ex The exception details
     * @return 404 Not Found
=======
                ErrorResponse.builder()
                        .status(400)
                        .message(ex.getMessage())
                        .build()
        );
    }

    /**
     * Handles resource not found exceptions
     * Returns HTTP 404 Not Found
>>>>>>> origin/feature/user-auth
     */
=======
                ErrorResponse.builder().status(400).message(ex.getMessage()).build()
        );
    }

>>>>>>> origin/feature/user-management
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
<<<<<<< HEAD
<<<<<<< HEAD
                ErrorResponse.builder().status(404).message(ex.getMessage()).build());
    }

    /**
     * Handles Spring standard MethodArgumentNotValidException.
     * Extracts field-level validation errors for client-side display.
     * 
     * @param ex The validation failure
     * @return 400 Bad Request with specific field error message
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
=======
                ErrorResponse.builder()
                        .status(404)
                        .message(ex.getMessage())
                        .build()
        );
    }

    /**
     * Handles method argument validation exceptions (Spring validation)
     * Returns HTTP 400 Bad Request
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {
>>>>>>> origin/feature/user-auth
=======
                ErrorResponse.builder().status(404).message(ex.getMessage()).build()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
>>>>>>> origin/feature/user-management
        String message = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");

        log.warn("Validation failed: {}", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
<<<<<<< HEAD
<<<<<<< HEAD
                ErrorResponse.builder().status(400).message(message).build());
    }

    /**
     * Catch-all handler for unexpected RuntimeExceptions.
     * Logs the full stack trace for debugging but returns a generic message to the
     * client.
     * 
     * @param ex The unexpected error
     * @return 500 Internal Server Error
     */
=======
                ErrorResponse.builder().status(400).message(message).build()
        );
    }

>>>>>>> origin/feature/user-management
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex) {
        log.error("Unexpected runtime exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
<<<<<<< HEAD
                ErrorResponse.builder().status(500).message("An unexpected error occurred").build());
    }

    /**
     * Global catch-all for any checked exceptions not caught by specific handlers.
     * 
     * @param ex The exception
     * @return 500 Internal Server Error
     */
=======
                ErrorResponse.builder().status(500).message("An unexpected error occurred").build()
        );
    }

>>>>>>> origin/feature/user-management
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
<<<<<<< HEAD
                ErrorResponse.builder().status(500).message("An unexpected error occurred").build());
    }
}
=======
                ErrorResponse.builder()
                        .status(400)
                        .message(message)
                        .build()
        );
    }

    /**
     * Fallback handler for all other RuntimeExceptions
     * Returns HTTP 400 Bad Request
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex) {
        log.error("Unexpected runtime exception: ", ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                        .status(400)
                        .message(ex.getMessage())
                        .build()
        );
    }

    /**
     * Fallback handler for all uncaught exceptions
     * Returns HTTP 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex) {
        log.error("Unexpected error occurred: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                        .status(500)
                        .message("An unexpected error occurred. Please try again later.")
                        .build()
        );
    }
}
>>>>>>> origin/feature/user-auth
=======
                ErrorResponse.builder().status(500).message("An unexpected error occurred").build()
        );
    }
}
>>>>>>> origin/feature/user-management
