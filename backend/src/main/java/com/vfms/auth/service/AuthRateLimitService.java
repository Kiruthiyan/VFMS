package com.vfms.auth.service;

import com.vfms.common.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter for authentication endpoints.
 */
@Service
public class AuthRateLimitService {

    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, Deque<Long>> attempts = new ConcurrentHashMap<>();

    @Value("${vfms.auth.rate-limit.max-requests:10}")
    private int maxRequests;

    public void check(HttpServletRequest request, String action) {
        String key = action + ":" + resolveClientIp(request);
        long now = System.currentTimeMillis();
        long windowStart = now - WINDOW.toMillis();

        Deque<Long> timestamps = attempts.compute(key, (k, deque) -> {
            Deque<Long> bucket = deque != null ? deque : new ArrayDeque<>();
            while (!bucket.isEmpty() && bucket.peekFirst() < windowStart) {
                bucket.pollFirst();
            }
            return bucket;
        });

        if (timestamps.size() >= maxRequests) {
            throw new ValidationException(
                    "Too many attempts. Please wait a few minutes before trying again."
            );
        }

        timestamps.addLast(now);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
