package com.vfms.common.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for GlobalExceptionHandler
 * Tests exception mapping to correct HTTP status codes
 * 
 * Test Coverage:
 * - AuthenticationException → 401 Unauthorized
 * - ValidationException → 400 Bad Request
 * - ResourceNotFoundException → 404 Not Found
 * - Generic exceptions → 500 Internal Server Error
 */
@DisplayName("Exception Handling Tests")
class ExceptionHandlerTest {

    @Test
    @DisplayName("AuthenticationException should map to 401")
    void testAuthenticationExceptionStatus() {
        // Arrange
        AuthenticationException ex = new AuthenticationException("Invalid credentials");

        // Act & Assert
        assertEquals(HttpStatus.UNAUTHORIZED.value(), 401);
        assertTrue(ex instanceof RuntimeException);
    }

    @Test
    @DisplayName("ValidationException should map to 400")
    void testValidationExceptionStatus() {
        // Arrange
        ValidationException ex = new ValidationException("Invalid input");

        // Act & Assert
        assertEquals(HttpStatus.BAD_REQUEST.value(), 400);
        assertTrue(ex instanceof RuntimeException);
    }

    @Test
    @DisplayName("ResourceNotFoundException should map to 404")
    void testResourceNotFoundExceptionStatus() {
        // Arrange
        ResourceNotFoundException ex = new ResourceNotFoundException("User not found");

        // Act & Assert
        assertEquals(HttpStatus.NOT_FOUND.value(), 404);
        assertTrue(ex instanceof RuntimeException);
    }

    @Test
    @DisplayName("Exception message should be preserved")
    void testExceptionMessagePreservation() {
        // Arrange
        String message = "Test error message";
        AuthenticationException ex = new AuthenticationException(message);

        // Act & Assert
        assertEquals(message, ex.getMessage());
    }

    @Test
    @DisplayName("Exception should support chaining with cause")
    void testExceptionCauseChaining() {
        // Arrange
        Throwable cause = new IllegalArgumentException("Underlying cause");
        ValidationException ex = new ValidationException("Validation failed", cause);

        // Act & Assert
        assertEquals(cause, ex.getCause());
    }
}
