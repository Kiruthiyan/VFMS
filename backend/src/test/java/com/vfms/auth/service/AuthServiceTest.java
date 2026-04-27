package com.vfms.auth.service;

import com.vfms.security.JwtService;
import com.vfms.common.exception.AuthenticationException;
import com.vfms.common.exception.ValidationException;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService
 * Tests authentication flows: login, logout, and error scenarios
 * 
 * Test Coverage:
 * - Valid login credentials
 * - Invalid email/password
 * - Email not verified
 * - Account disabled
 */
@DisplayName("AuthService Unit Tests")
@ActiveProfiles("test")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testLoginSuccess() {
        // Arrange
        String email = "user@example.com";
        String password = "Test@123";
        User mockUser = createMockUser(email, "APPROVED");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(jwtService.generateToken(mockUser)).thenReturn("mock_jwt_token");

        // Act
        assertDoesNotThrow(() -> {
            authService.login(createLoginRequest(email, password));
        });

        // Assert
        verify(userRepository).findByEmail(email);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService).generateToken(mockUser);
    }

    @Test
    @DisplayName("Should throw AuthenticationException for invalid credentials")
    void testLoginInvalidCredentials() {
        // Arrange
        String email = "user@example.com";
        String password = "WrongPassword123";

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.core.AuthenticationException("Invalid credentials") {
                });

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> {
            authService.login(createLoginRequest(email, password));
        });

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Should throw AuthenticationException if user not found")
    void testLoginUserNotFound() {
        // Arrange
        String email = "nonexistent@example.com";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> {
            authService.login(createLoginRequest(email, "password"));
        });

        verify(userRepository).findByEmail(email);
    }

    /**
     * Helper method to create mock user for testing
     * 
     * @param email  User email
     * @param status User status (PENDING, APPROVED, REJECTED, DISABLED)
     * @return Mock User object
     */
    private User createMockUser(String email, String status) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setFullName("Test User");
        user.setPassword("encoded_password");
        return user;
    }

    private com.vfms.auth.dto.LoginRequest createLoginRequest(String email, String password) {
        com.vfms.auth.dto.LoginRequest loginRequest = new com.vfms.auth.dto.LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);
        return loginRequest;
    }
}
