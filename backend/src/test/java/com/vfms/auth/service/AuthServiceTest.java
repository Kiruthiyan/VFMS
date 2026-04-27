package com.vfms.auth.service;

import com.vfms.auth.dto.LoginRequest;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.repository.EmailVerificationTokenRepository;
import com.vfms.auth.entity.RefreshToken;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.common.exception.AuthenticationException;
import com.vfms.common.exception.ValidationException;
import com.vfms.security.JwtService;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailVerificationTokenRepository verificationTokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void shouldLoginSuccessfullyWithValidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("Secure@123");

        User user = User.builder()
                .id(UUID.randomUUID())
                .fullName("Test User")
                .email("user@example.com")
                .password("encoded-password")
                .role(Role.SYSTEM_USER)
                .status(UserStatus.APPROVED)
                .emailVerified(true)
                .phone("0771234567")
                .nic("123456789")
                .build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");
        when(refreshTokenService.createRefreshToken(user)).thenReturn(
                RefreshToken.builder().token("refresh-token").user(user).build()
        );

        assertEquals("jwt-token", authService.login(request).getAccessToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("user@example.com");
    }

    @Test
    @DisplayName("Should throw AuthenticationException when authenticated user cannot be loaded")
    void shouldThrowAuthenticationExceptionWhenAuthenticatedUserCannotBeLoaded() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@example.com");
        request.setPassword("Secure@123");

        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(AuthenticationException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should reject registration when passwords do not match")
    void shouldRejectRegistrationWhenPasswordsDoNotMatch() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("new@example.com");
        request.setPhone("0771234567");
        request.setNic("123456789");
        request.setPassword("Secure@123");
        request.setConfirmPassword("Mismatch@123");
        request.setRequestedRole(Role.SYSTEM_USER);
        request.setEmployeeId("EMP001");
        request.setDepartment("Operations");
        request.setOfficeLocation("HQ");
        request.setDesignation("Coordinator");

        assertThrows(ValidationException.class, () -> authService.register(request));
    }
}
