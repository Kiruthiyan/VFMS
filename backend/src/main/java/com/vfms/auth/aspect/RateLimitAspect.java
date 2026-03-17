package com.vfms.auth.aspect;

import com.vfms.auth.annotation.RateLimited;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * AOP Aspect for implementing rate limiting on endpoints.
 * Tracks request attempts per IP address and enforces rate limits.
 */
@Aspect
@Component
@Slf4j
public class RateLimitAspect {

    /**
     * Store: Key = "IP:endpoint", Value = [attemptCount, lastResetTime]
     */
    private final ConcurrentHashMap<String, long[]> rateLimitMap = new ConcurrentHashMap<>();

    /**
     * Intercept methods annotated with @RateLimited
     */
    @Before("@annotation(rateLimited)")
    public void checkRateLimit(JoinPoint joinPoint, RateLimited rateLimited) throws Throwable {
        // Get client IP
        String clientIp = getClientIp();
        String endpoint = joinPoint.getSignature().getName();
        String key = clientIp + ":" + endpoint;

        // Get rate limit config
        int maxAttempts = rateLimited.maxAttempts();
        long timeWindowMillis = TimeUnit.MINUTES.toMillis(rateLimited.timeWindowMinutes());

        // Check and update rate limit map
        long currentTime = System.currentTimeMillis();
        long[] attempts = rateLimitMap.getOrDefault(key, new long[]{0, currentTime});

        // Reset counter if time window has passed
        if (currentTime - attempts[1] > timeWindowMillis) {
            attempts = new long[]{0, currentTime};
        }

        // Check if limit exceeded
        if (attempts[0] >= maxAttempts) {
            log.warn("Rate limit exceeded for IP: {} on endpoint: {} ({}attempts in {}min)",
                    clientIp, endpoint, maxAttempts, rateLimited.timeWindowMinutes());
            throw new RuntimeException(rateLimited.message());
        }

        // Increment attempt counter
        attempts[0]++;
        rateLimitMap.put(key, attempts);

        log.debug("Rate limit check passed for IP: {} on endpoint: {} (Attempt {}/{})",
                clientIp, endpoint, attempts[0], maxAttempts);
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            
            if (attributes == null) {
                return "UNKNOWN";
            }
            
            String ip = attributes.getRequest().getHeader("X-Forwarded-For");
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // In case of multiple IPs, take the first one
                return ip.split(",")[0].trim();
            }
            
            ip = attributes.getRequest().getHeader("X-Real-IP");
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip;
            }
            
            return attributes.getRequest().getRemoteAddr();
        } catch (Exception e) {
            log.error("Error extracting client IP", e);
            return "UNKNOWN";
        }
    }
}
