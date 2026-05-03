package com.vfms.common.exception;

import java.util.Map;

public class ValidationException extends RuntimeException {
    private final Map<String, String> errors;

    public ValidationException(String message) {
        this(message, Map.of());
    }

    public ValidationException(String message, Throwable cause) {
        this(message, Map.of(), cause);
    }

    public ValidationException(String message, Map<String, String> errors) {
        this(message, errors, null);
    }

    public ValidationException(
            String message,
            Map<String, String> errors,
            Throwable cause
    ) {
        super(message);
        if (cause != null) {
            initCause(cause);
        }
        this.errors = errors == null ? Map.of() : Map.copyOf(errors);
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
