package com.vfms.auth.annotation;

import java.lang.annotation.*;
import java.util.concurrent.TimeUnit;

/**
 * Annotation for rate limiting requests to specific endpoints.
 * Prevents brute force attacks on sensitive endpoints like login and OTP verification.
 * 
 * Usage: @RateLimited(maxAttempts = 5, timeWindowMinutes = 15)
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimited {
    /**
     * Maximum number of attempts allowed within the time window
     */
    int maxAttempts() default 5;

    /**
     * Time window in minutes for rate limiting
     */
    int timeWindowMinutes() default 15;

    /**
     * Error message to return when rate limit is exceeded
     */
    String message() default "Too many attempts. Please try again later.";
}
