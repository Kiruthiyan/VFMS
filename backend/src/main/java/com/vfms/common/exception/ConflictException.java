package com.vfms.common.exception;

import java.util.Map;

public class ConflictException extends RuntimeException {
    private final Map<String, String> errors;

    public ConflictException(String message) {
        this(message, Map.of());
    }

    public ConflictException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors == null ? Map.of() : Map.copyOf(errors);
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
