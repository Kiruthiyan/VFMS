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

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
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

    @Test
    @DisplayName("Should reject staff registration without office location")
    void shouldRejectStaffRegistrationWithoutOfficeLocation() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Staff User");
        request.setEmail("staff@example.com");
        request.setPhone("0771234567");
        request.setNic("200012345678");
        request.setPassword("Secure@123");
        request.setConfirmPassword("Secure@123");
        request.setRequestedRole(Role.SYSTEM_USER);
        request.setEmployeeId("EMP001");
        request.setDepartment("Operations");
        request.setDesignation("Coordinator");
        request.setOfficeLocation("");

        ValidationException exception =
                assertThrows(ValidationException.class, () -> authService.register(request));

        assertEquals("Validation failed", exception.getMessage());
        assertEquals(
                "Please select or enter the staff office location.",
                exception.getErrors().get("officeLocation")
        );
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should allow driver registration without staff-only office location")
    void shouldAllowDriverRegistrationWithoutStaffOnlyOfficeLocation() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Driver User");
        request.setEmail("driver@example.com");
        request.setPhone("0771234567");
        request.setNic("200012345678");
        request.setPassword("Secure@123");
        request.setConfirmPassword("Secure@123");
        request.setRequestedRole(Role.DRIVER);
        request.setLicenseNumber("B123456");
        request.setLicenseExpiryDate(LocalDate.now().plusDays(30).toString());
        request.setOfficeLocation("");

        when(passwordEncoder.encode("Secure@123")).thenReturn("encoded-password");
        when(userRepository.findByEmail("driver@example.com")).thenReturn(Optional.empty());

        authService.register(request);

        verify(userRepository).save(any(User.class));
        verify(emailService).sendVerificationEmail(any(), any(), any());
    }

    @Test
    @DisplayName("Should throw conflict when email already exists")
    void shouldThrowConflictWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Driver User");
        request.setEmail("driver@example.com");
        request.setPhone("0771234567");
        request.setNic("200012345678");
        request.setPassword("Secure@123");
        request.setConfirmPassword("Secure@123");
        request.setRequestedRole(Role.DRIVER);
        request.setLicenseNumber("B123456");
        request.setLicenseExpiryDate(LocalDate.now().plusDays(30).toString());

        User existingUser = User.builder()
                .email("driver@example.com")
                .status(UserStatus.APPROVED)
                .build();

        when(userRepository.findByEmail("driver@example.com")).thenReturn(Optional.of(existingUser));

        com.vfms.common.exception.ConflictException exception =
                assertThrows(com.vfms.common.exception.ConflictException.class, () -> authService.register(request));

        assertEquals("An account already exists with this email address.", exception.getMessage());
        assertTrue(exception.getErrors().containsKey("email"));
    }
}
