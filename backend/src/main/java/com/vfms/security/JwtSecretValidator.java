package com.vfms.security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Ensures JWT signing key is not left at the documented development placeholder.
 */
@Component
public class JwtSecretValidator {

    private static final String DEFAULT_PLACEHOLDER = "replace-with-a-strong-32-char-plus-secret";

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @PostConstruct
    void validateSecretKey() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET is not configured. Set a strong secret (32+ characters) in backend/.env."
            );
        }
        if (DEFAULT_PLACEHOLDER.equals(secretKey)) {
            throw new IllegalStateException(
                    "JWT_SECRET is still the default placeholder. Set a strong secret in backend/.env."
            );
        }
        if (secretKey.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 characters for HS256 signing."
            );
        }
    }
}
