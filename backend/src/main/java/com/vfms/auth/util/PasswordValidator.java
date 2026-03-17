package com.vfms.auth.util;

import com.vfms.auth.exception.PasswordComplexityException;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility class for password validation and complexity checking
 */
@Slf4j
public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    private static final String UPPERCASE_PATTERN = ".*[A-Z].*";
    private static final String LOWERCASE_PATTERN = ".*[a-z].*";
    private static final String DIGIT_PATTERN = ".*\\d.*";
    private static final String SPECIAL_CHAR_PATTERN = ".*[!@#$%^&*()_+\\-=\\[\\]{}|;:',.<>?/~`].*";

    /**
     * Validate password meets complexity requirements
     * @param password Password to validate
     * @throws PasswordComplexityException if password doesn't meet requirements
     */
    public static void validatePassword(String password) {
        if (password == null || password.isEmpty()) {
            throw new PasswordComplexityException("Password cannot be empty");
        }

        if (password.length() < MIN_LENGTH) {
            throw new PasswordComplexityException(
                    String.format("Password must be at least %d characters long", MIN_LENGTH));
        }

        if (password.length() > MAX_LENGTH) {
            throw new PasswordComplexityException(
                    String.format("Password must not exceed %d characters", MAX_LENGTH));
        }

        if (!password.matches(UPPERCASE_PATTERN)) {
            throw new PasswordComplexityException(
                    "Password must contain at least one uppercase letter (A-Z)");
        }

        if (!password.matches(LOWERCASE_PATTERN)) {
            throw new PasswordComplexityException(
                    "Password must contain at least one lowercase letter (a-z)");
        }

        if (!password.matches(DIGIT_PATTERN)) {
            throw new PasswordComplexityException(
                    "Password must contain at least one digit (0-9)");
        }

        if (!password.matches(SPECIAL_CHAR_PATTERN)) {
            throw new PasswordComplexityException(
                    "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:',.<>?/~`)");
        }

        log.debug("Password validation successful");
    }

    /**
     * Check if password meets complexity requirements without throwing exception
     * @param password Password to check
     * @return true if password is valid, false otherwise
     */
    public static boolean isValidPassword(String password) {
        try {
            validatePassword(password);
            return true;
        } catch (PasswordComplexityException e) {
            log.debug("Password validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get password requirements as a readable string
     * @return Requirements message
     */
    public static String getPasswordRequirements() {
        return "Password must:\n" +
                "• Be at least " + MIN_LENGTH + " characters long\n" +
                "• Not exceed " + MAX_LENGTH + " characters\n" +
                "• Include at least one uppercase letter (A-Z)\n" +
                "• Include at least one lowercase letter (a-z)\n" +
                "• Include at least one digit (0-9)\n" +
                "• Include at least one special character (!@#$%^&*()_+-=[]{}|;:',.<>?/~`)";
    }
}
