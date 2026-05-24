package com.vfms.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility class for retrieving current authenticated user from Spring Security context
 * Provides convenient access to current user details and authentication information
 */
public class SecurityContextProvider {

    private SecurityContextProvider() {
        // Utility class - prevent instantiation
    }

    /**
     * Get the email of the currently authenticated user
     * @return Email of authenticated user, or "SYSTEM" if not authenticated
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "SYSTEM";
    }

    /**
     * Check if current user is authenticated
     * @return true if user is authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * Get the Spring Security Authentication object
     * @return Current authentication, or null if not authenticated
     */
    private static Authentication getAuthentication() {
        try {
            return SecurityContextHolder.getContext().getAuthentication();
        } catch (Exception e) {
            return null;
        }
    }
}
