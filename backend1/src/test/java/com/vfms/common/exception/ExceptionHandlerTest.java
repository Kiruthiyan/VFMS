package com.vfms.common.exception;

import com.vfms.common.dto.ErrorResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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
        assertFalse(response.getBody().isSuccess());
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
        assertFalse(response.getBody().isSuccess());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Invalid input", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should map authorization failures to 403")
    void shouldMapAuthorizationFailuresTo403() {
        ResponseEntity<ErrorResponse> response =
                exceptionHandler.handleAuthorization(new AuthorizationException("Account pending approval"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals(403, response.getBody().getStatus());
        assertEquals("Account pending approval", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should map conflicts to 409 with field errors")
    void shouldMapConflictsTo409WithFieldErrors() {
        ResponseEntity<ErrorResponse> response =
                exceptionHandler.handleConflict(
                        new ConflictException(
                                "Duplicate account",
                                java.util.Map.of("email", "An account already exists with this email address.")
                        )
                );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Duplicate account", response.getBody().getMessage());
        assertEquals(
                "An account already exists with this email address.",
                response.getBody().getErrors().get("email")
        );
    }

    @Test
    @DisplayName("Should map missing resources to 404")
    void shouldMapMissingResourcesTo404() {
        ResponseEntity<ErrorResponse> response =
                exceptionHandler.handleNotFound(new ResourceNotFoundException("Missing resource"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("Missing resource", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should map bean validation failures to 400 with field errors")
    void shouldMapBeanValidationFailuresTo400WithFieldErrors() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(new TestPayload(), "testPayload");
        bindingResult.addError(new FieldError(
                "testPayload",
                "email",
                "Please enter a valid email address."
        ));

        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(
                new MethodParameter(
                        TestController.class.getDeclaredMethod("handle", TestPayload.class),
                        0
                ),
                bindingResult
        );

        ResponseEntity<ErrorResponse> response =
                exceptionHandler.handleMethodArgumentNotValid(exception);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Validation failed", response.getBody().getMessage());
        assertEquals(
                "Please enter a valid email address.",
                response.getBody().getErrors().get("email")
        );
    }

    private static final class TestController {
        @SuppressWarnings("unused")
        void handle(TestPayload payload) {
        }
    }

    private static final class TestPayload {
    }
}
