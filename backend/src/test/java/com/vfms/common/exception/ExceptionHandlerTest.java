package com.vfms.common.exception;

import com.vfms.common.dto.ErrorResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DisplayName("GlobalExceptionHandler Unit Tests")
class ExceptionHandlerTest {

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

    @Test
    @DisplayName("Should map authentication failures to 401")
    void shouldMapAuthenticationFailuresTo401() {
        ResponseEntity<ErrorResponse> response =
                exceptionHandler.handleAuthentication(new AuthenticationException("Invalid credentials"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(401, response.getBody().getStatus());
        assertEquals("Invalid credentials", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should map validation failures to 400")
    void shouldMapValidationFailuresTo400() {
        ResponseEntity<ErrorResponse> response =
                exceptionHandler.handleValidation(new ValidationException("Invalid input"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Invalid input", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should map missing resources to 404")
    void shouldMapMissingResourcesTo404() {
        ResponseEntity<ErrorResponse> response =
                exceptionHandler.handleNotFound(new ResourceNotFoundException("Missing resource"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("Missing resource", response.getBody().getMessage());
    }
}
