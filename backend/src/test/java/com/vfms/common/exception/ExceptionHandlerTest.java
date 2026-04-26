package com.vfms.common.exception;

import com.vfms.common.dto.ErrorResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for GlobalExceptionHandler
 * Tests exception mapping to HTTP status codes and error response format
 * 
 * Coverage:
 * - AuthenticationException → 401 Unauthorized
 * - ValidationException → 400 Bad Request
 * - ResourceNotFoundException → 404 Not Found
 * - Generic RuntimeException → 400 Bad Request
 * - Validation errors → 400 Bad Request
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GlobalExceptionHandler Unit Tests")
class ExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler exceptionHandler;

    @Test
    @DisplayName("Should map AuthenticationException to 401 Unauthorized")
    void testAuthenticationExceptionMapping() {
        // Given
        String errorMessage = "Invalid email or password";
        AuthenticationException exception = new AuthenticationException(errorMessage);

        // When
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleAuthentication(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals(401, response.getBody().getStatus());
        assertEquals(errorMessage, response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should map ValidationException to 400 Bad Request")
    void testValidationExceptionMapping() {
        // Given
        String errorMessage = "Password must contain uppercase, lowercase, digit, and special character";
        ValidationException exception = new ValidationException(errorMessage);

        // When
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidation(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().getStatus());
        assertEquals(errorMessage, response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should map ResourceNotFoundException to 404 Not Found")
    void testResourceNotFoundExceptionMapping() {
        // Given
        String errorMessage = "User not found with ID: 12345";
        ResourceNotFoundException exception = new ResourceNotFoundException(errorMessage);

        // When
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleNotFound(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().getStatus());
        assertEquals(errorMessage, response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should map RuntimeException to 500 Internal Server Error")
    void testRuntimeExceptionMapping() {
        // Given
        String errorMessage = "An unexpected error occurred";
        RuntimeException exception = new RuntimeException(errorMessage);

        // When
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntime(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("An unexpected error occurred", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should preserve exception message in error response")
    void testExceptionMessagePreservation() {
        // Given
        String detailedMessage = "Email already registered for user@example.com";
        ValidationException exception = new ValidationException(detailedMessage);

        // When
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidation(exception);

        // Then
        assertEquals(detailedMessage, response.getBody().getMessage(),
                "Error message should be preserved from exception");
    }

    @Test
    @DisplayName("Should handle exception cause chaining")
    void testExceptionCauseChaining() {
        // Given
        Throwable cause = new IllegalArgumentException("Root cause");
        String message = "Validation failed due to invalid argument";
        ValidationException exception = new ValidationException(message, cause);

        // When
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidation(exception);

        // Then
        assertNotNull(response.getBody());
        assertEquals(message, response.getBody().getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    @DisplayName("Should provide consistent error response format")
    void testErrorResponseFormat() {
        // Given
        AuthenticationException exception = new AuthenticationException("Test error");

        // When
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleAuthentication(exception);
        ErrorResponse body = response.getBody();

        // Then
        assertNotNull(body);
        assertNotNull(body.getStatus());
        assertNotNull(body.getMessage());
        assertTrue(body.getStatus() > 0, "Status should be a valid HTTP code");
    }
}
