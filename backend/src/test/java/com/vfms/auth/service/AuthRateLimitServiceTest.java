package com.vfms.auth.service;

import com.vfms.auth.entity.AuthRateLimitAttempt;
import com.vfms.auth.repository.AuthRateLimitAttemptRepository;
import com.vfms.common.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthRateLimitService")
class AuthRateLimitServiceTest {

    @Mock
    private AuthRateLimitAttemptRepository attemptRepository;

    private AuthRateLimitService service;

    @BeforeEach
    void setUp() {
        service = new AuthRateLimitService(attemptRepository);
        ReflectionTestUtils.setField(service, "maxRequests", 2);
    }

    @Test
    @DisplayName("ignores spoofable X-Forwarded-For header and keys on the socket remote address")
    void check_shouldIgnoreForwardedForHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.5");
        request.addHeader("X-Forwarded-For", "203.0.113.10");
        when(attemptRepository.countByRateKeyAndAttemptedAtAfter(eq("login:10.0.0.5"), any()))
                .thenReturn(0L);

        service.check(request, "login");

        ArgumentCaptor<AuthRateLimitAttempt> captor =
                ArgumentCaptor.forClass(AuthRateLimitAttempt.class);
        verify(attemptRepository).save(captor.capture());
        assertEquals("login:10.0.0.5", captor.getValue().getRateKey());
    }

    @Test
    @DisplayName("records allowed attempts using action and client IP")
    void check_shouldRecordAllowedAttempt() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.5");
        when(attemptRepository.countByRateKeyAndAttemptedAtAfter(eq("login:10.0.0.5"), any()))
                .thenReturn(1L);

        service.check(request, "login");

        ArgumentCaptor<AuthRateLimitAttempt> captor =
                ArgumentCaptor.forClass(AuthRateLimitAttempt.class);
        verify(attemptRepository).save(captor.capture());
        assertEquals("login:10.0.0.5", captor.getValue().getRateKey());
        assertTrue(captor.getValue().getAttemptedAt().isBefore(Instant.now().plusSeconds(1)));
    }

    @Test
    @DisplayName("blocks attempts that exceed the configured window limit")
    void check_shouldBlockWhenLimitReached() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("203.0.113.10");
        when(attemptRepository.countByRateKeyAndAttemptedAtAfter(eq("forgot-password:203.0.113.10"), any()))
                .thenReturn(2L);

        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> service.check(request, "forgot-password")
        );

        assertEquals("Too many attempts. Please wait a few minutes before trying again.", exception.getMessage());
        verify(attemptRepository, never()).save(any());
    }
}
