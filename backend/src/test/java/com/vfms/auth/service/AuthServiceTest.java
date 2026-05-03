package com.vfms.auth.service;

import com.vfms.auth.dto.LoginRequest;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.dto.StaffVerificationRequest;
import com.vfms.auth.entity.EmailVerificationToken;
import com.vfms.auth.entity.RefreshToken;
import com.vfms.auth.repository.EmailVerificationTokenRepository;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.common.exception.AuthenticationException;
import com.vfms.common.exception.ValidationException;
import com.vfms.employee.entity.EmployeeRegistryRecord;
import com.vfms.employee.repository.EmployeeRegistryRepository;
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

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailVerificationTokenRepository verificationTokenRepository;

    @Mock
    private EmployeeRegistryRepository employeeRegistryRepository;

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
    @DisplayName("logs in approved users with valid credentials")
    void logsInApprovedUsersWithValidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("TestPassword123!");

        User user = User.builder()
                .id(UUID.randomUUID())
                .fullName("Test User")
                .email("user@example.com")
                .password("encoded-test-password")
                .role(Role.SYSTEM_USER)
                .status(UserStatus.APPROVED)
                .emailVerified(true)
                .phone("0771234567")
                .nic("200012345678")
                .build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("fake-test-secret-only");
        when(refreshTokenService.createRefreshToken(user)).thenReturn(
                RefreshToken.builder().token("fake-test-secret-only").user(user).build()
        );

        assertEquals("fake-test-secret-only", authService.login(request).getAccessToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("user@example.com");
    }

    @Test
    @DisplayName("rejects login when no account exists for the email")
    void rejectsLoginWhenNoAccountExistsForTheEmail() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@example.com");
        request.setPassword("TestPassword123!");

        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(AuthenticationException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("rejects registration when passwords do not match")
    void rejectsRegistrationWhenPasswordsDoNotMatch() {
        RegisterRequest request = buildRegisterRequest();
        request.setConfirmPassword("MismatchTestPassword123!");

        ValidationException exception =
                assertThrows(ValidationException.class, () -> authService.register(request));

        assertEquals("Passwords do not match.", exception.getErrors().get("confirmPassword"));
    }

    @Test
    @DisplayName("rejects public self-registration for non-staff roles")
    void rejectsPublicSelfRegistrationForNonStaffRoles() {
        RegisterRequest request = buildRegisterRequest();
        request.setRequestedRole(Role.DRIVER);

        ValidationException exception =
                assertThrows(ValidationException.class, () -> authService.register(request));

        assertEquals(
                "Public registration is available only for company staff. Driver, approver, and administrator accounts must be created by an administrator.",
                exception.getErrors().get("requestedRole")
        );
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("rejects staff email step when no registry record matches")
    void rejectsStaffEmailStepWhenNoRegistryRecordMatches() {
        when(employeeRegistryRepository.findAllByEmailIgnoreCase("staff@example.com"))
                .thenReturn(List.of());

        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> authService.verifyStaffEmailEligibility("staff@example.com")
        );

        assertEquals("Staff record not found", exception.getMessage());
        assertEquals(
                "This email address is not registered in the company staff registry. Please use your official company email address or contact the system administrator.",
                exception.getErrors().get("email")
        );
    }

    @Test
    @DisplayName("rejects staff verification when registry details do not match")
    void rejectsStaffVerificationWhenRegistryDetailsDoNotMatch() {
        StaffVerificationRequest request = new StaffVerificationRequest();
        request.setEmail("staff@example.com");
        request.setFullName("Staff User");
        request.setPhone("0771234567");
        request.setNic("200012345678");
        request.setEmployeeId("EMP001");

        when(employeeRegistryRepository.findAllByEmployeeIdIgnoreCase("EMP001")).thenReturn(
                List.of(
                        EmployeeRegistryRecord.builder()
                                .employeeId("EMP001")
                                .email("staff@example.com")
                                .phone("0719999999")
                                .nic("200012345678")
                                .fullName("Staff User")
                                .department("Operations")
                                .designation("Coordinator")
                                .officeLocation("Head Office")
                                .active(true)
                                .build()
                )
        );

        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> authService.verifyStaffRegistrationDetails(request)
        );

        assertEquals("Staff verification failed", exception.getMessage());
        assertEquals(
                "The phone number does not match the verified company staff record for this employee ID.",
                exception.getErrors().get("phone")
        );
    }

    @Test
    @DisplayName("registers verified staff and copies registry-backed fields")
    void registersVerifiedStaffAndCopiesRegistryBackedFields() {
        RegisterRequest request = buildRegisterRequest();
        request.setFullName("Registry Staff");

        when(employeeRegistryRepository.findAllByEmployeeIdIgnoreCase("EMP001")).thenReturn(
                List.of(
                        EmployeeRegistryRecord.builder()
                                .employeeId("EMP001")
                                .email("staff@example.com")
                                .phone("0771234567")
                                .nic("200012345678")
                                .fullName("Registry Staff")
                                .department("Operations")
                                .designation("Coordinator")
                                .officeLocation("Head Office")
                                .active(true)
                                .build()
                )
        );
        when(passwordEncoder.encode("TestPassword123!")).thenReturn("encoded-test-password");
        when(userRepository.findByEmail("staff@example.com")).thenReturn(Optional.empty());

        authService.register(request);

        verify(userRepository).save(argThat(user ->
                user.getRole() == Role.SYSTEM_USER
                        && "Registry Staff".equals(user.getFullName())
                        && "EMP001".equals(user.getEmployeeId())
                        && "Operations".equals(user.getDepartment())
                        && "Coordinator".equals(user.getDesignation())
                        && "Head Office".equals(user.getOfficeLocation())
                        && user.getStatus() == UserStatus.EMAIL_UNVERIFIED
        ));
        verify(emailService).sendVerificationEmail(any(), any(), any());
    }

    @Test
    @DisplayName("auto-approves verified company staff after email confirmation")
    void autoApprovesVerifiedCompanyStaffAfterEmailConfirmation() {
        User user = User.builder()
                .email("staff@example.com")
                .role(Role.SYSTEM_USER)
                .status(UserStatus.EMAIL_UNVERIFIED)
                .emailVerified(false)
                .build();
        EmailVerificationToken token = EmailVerificationToken.builder()
                .token("token-123")
                .user(user)
                .expiryDate(Instant.now().plusSeconds(3600))
                .build();

        when(verificationTokenRepository.findByToken("token-123")).thenReturn(Optional.of(token));

        UserStatus status = authService.verifyEmail("token-123");

        assertEquals(UserStatus.APPROVED, status);
        assertTrue(user.isEmailVerified());
        assertEquals(UserStatus.APPROVED, user.getStatus());
        verify(userRepository).save(user);
        verify(verificationTokenRepository).deleteByUser(user);
    }

    private RegisterRequest buildRegisterRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Staff User");
        request.setEmail("staff@example.com");
        request.setPhone("0771234567");
        request.setNic("200012345678");
        request.setPassword("TestPassword123!");
        request.setConfirmPassword("TestPassword123!");
        request.setRequestedRole(Role.SYSTEM_USER);
        request.setEmployeeId("EMP001");
        return request;
    }
}
