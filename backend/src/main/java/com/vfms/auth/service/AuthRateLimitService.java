package com.vfms.auth.service;

import com.vfms.auth.entity.AuthRateLimitAttempt;
import com.vfms.auth.repository.AuthRateLimitAttemptRepository;
import com.vfms.common.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Duration;

/**
 * Database-backed rate limiter for authentication endpoints.
 * This keeps limits consistent across multiple backend instances.
 */
@Service
@RequiredArgsConstructor
public class AuthRateLimitService {

    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final AuthRateLimitAttemptRepository attemptRepository;

    @Value("${vfms.auth.rate-limit.max-requests:10}")
    private int maxRequests;

    @Transactional
    public void check(HttpServletRequest request, String action) {
        String key = action + ":" + resolveClientIp(request);
        Instant now = Instant.now();
        Instant windowStart = now.minus(WINDOW);

        attemptRepository.deleteByAttemptedAtBefore(windowStart);

        if (attemptRepository.countByRateKeyAndAttemptedAtAfter(key, windowStart) >= maxRequests) {
            throw new ValidationException(
                    "Too many attempts. Please wait a few minutes before trying again."
            );
        }

        attemptRepository.save(AuthRateLimitAttempt.builder()
                .rateKey(key)
                .attemptedAt(now)
                .build());
    }

    private String resolveClientIp(HttpServletRequest request) {
        // X-Forwarded-For is client-controlled and not validated against any
        // trusted proxy list in this deployment, so it must not be trusted
        // for rate-limit key derivation (trivially spoofable to bypass limits).
        return request.getRemoteAddr();
    }
}
