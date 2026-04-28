package com.vfms.admin.service;

import com.vfms.admin.config.UserManagementProperties;
import com.vfms.admin.dto.CreateUserRequest;
import com.vfms.admin.dto.ReviewDecision;
import com.vfms.admin.dto.ReviewUserRequest;
import com.vfms.admin.dto.SoftDeleteRequest;
import com.vfms.admin.dto.UpdateUserRequest;
import com.vfms.auth.service.EmailService;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.common.exception.ValidationException;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminUserService Unit Tests")
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserManagementProperties userManagementProperties;

    @InjectMocks
    private AdminUserService adminUserService;

    @BeforeEach
    void setUp() {
        UserManagementProperties.TempPassword tempPassword =
                new UserManagementProperties.TempPassword();
        tempPassword.setLength(10);
        tempPassword.setChars("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%");
        lenient().when(userManagementProperties.getTempPassword()).thenReturn(tempPassword);
    }

    @Test
    @DisplayName("createUser should reject duplicate active email")
    void createUser_shouldRejectDuplicateEmail() {
        CreateUserRequest req = new CreateUserRequest();
        req.setFullName("Test User");
        req.setEmail("test@vfms.com");
        req.setPhone("0771234567");
        req.setNic("123456789");
        req.setRole(Role.SYSTEM_USER);

        when(userRepository.existsByEmailAndDeletedAtIsNull(req.getEmail())).thenReturn(true);

        assertThrows(ValidationException.class, () -> adminUserService.createUser(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("reviewUser APPROVE should set APPROVED and clear rejectionReason")
    void reviewUser_approve_shouldApprove() {
        UUID id = UUID.randomUUID();
        User user = basePendingUser(id);

        ReviewUserRequest req = new ReviewUserRequest();
        req.setDecision(ReviewDecision.APPROVE);
        req.setAssignedRole(Role.APPROVER);

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        adminUserService.reviewUser(id, req);

        assertEquals(UserStatus.APPROVED, user.getStatus());
        assertNull(user.getRejectionReason());
        assertNotNull(user.getReviewedAt());
        assertEquals(Role.APPROVER, user.getRole());
        verify(userRepository).save(user);
        verify(emailService).sendApprovalEmail(eq(user.getEmail()), eq(user.getFullName()), anyString());
    }

    @Test
    @DisplayName("reviewUser REJECT should require rejectionReason")
    void reviewUser_reject_shouldRequireReason() {
        UUID id = UUID.randomUUID();
        User user = basePendingUser(id);

        ReviewUserRequest req = new ReviewUserRequest();
        req.setDecision(ReviewDecision.REJECT);
        req.setRejectionReason("   ");

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        assertThrows(ValidationException.class, () -> adminUserService.reviewUser(id, req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("softDeleteUser should set deleted fields and DEACTIVATED status")
    void softDeleteUser_shouldSoftDelete() {
        UUID id = UUID.randomUUID();
        User user = baseApprovedUser(id);

        SoftDeleteRequest req = new SoftDeleteRequest();
        req.setReason("No longer active");

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        adminUserService.softDeleteUser(id, req);

        assertNotNull(user.getDeletedAt());
        assertEquals("No longer active", user.getDeletedReason());
        assertEquals(UserStatus.APPROVED, user.getStatusBeforeDeletion());
        assertEquals(UserStatus.DEACTIVATED, user.getStatus());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("restoreUser should restore previous status and clear deletion fields")
    void restoreUser_shouldRestorePreviousStatus() {
        UUID id = UUID.randomUUID();
        User user = baseApprovedUser(id);
        user.setStatusBeforeDeletion(UserStatus.APPROVED);
        user.setDeletedAt(LocalDateTime.now());
        user.setDeletedReason("Test");
        user.setDeletedBy("admin@vfms.com");
        user.setStatus(UserStatus.DEACTIVATED);

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        adminUserService.restoreUser(id);

        assertNull(user.getDeletedAt());
        assertNull(user.getDeletedReason());
        assertNull(user.getDeletedBy());
        assertNull(user.getStatusBeforeDeletion());
        assertEquals(UserStatus.APPROVED, user.getStatus());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("toggleUserStatus should flip APPROVED <-> DEACTIVATED")
    void toggleUserStatus_shouldToggle() {
        UUID id = UUID.randomUUID();
        User user = baseApprovedUser(id);

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        adminUserService.toggleUserStatus(id);
        assertEquals(UserStatus.DEACTIVATED, user.getStatus());

        adminUserService.toggleUserStatus(id);
        assertEquals(UserStatus.APPROVED, user.getStatus());

        verify(userRepository, times(2)).save(user);
    }

    @Test
    @DisplayName("updateUser should reject duplicate email among active users")
    void updateUser_shouldRejectDuplicateEmail() {
        UUID id = UUID.randomUUID();
        User user = baseApprovedUser(id);
        user.setEmail("old@vfms.com");

        UpdateUserRequest req = new UpdateUserRequest();
        req.setEmail("new@vfms.com");

        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailAndDeletedAtIsNull("new@vfms.com")).thenReturn(true);

        assertThrows(ValidationException.class, () -> adminUserService.updateUser(id, req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("createUser should normalize email and NIC before saving")
    void createUser_shouldNormalizeIdentityFields() {
        CreateUserRequest req = new CreateUserRequest();
        req.setFullName("Driver User");
        req.setEmail(" DRIVER@VFMS.COM ");
        req.setPhone("0771234567");
        req.setNic("200012345678");
        req.setRole(Role.DRIVER);
        req.setLicenseNumber("DL123456");
        req.setLicenseExpiryDate("2030-05-01");

        when(userRepository.existsByEmailAndDeletedAtIsNull("driver@vfms.com"))
                .thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-temp-password");

        adminUserService.createUser(req);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertEquals("driver@vfms.com", savedUser.getValue().getEmail());
        assertEquals("200012345678", savedUser.getValue().getNic());
    }

    @Test
    @DisplayName("updateUser should clear stale driver fields when role changes to staff")
    void updateUser_shouldClearDriverFieldsWhenRoleChanges() {
        UUID id = UUID.randomUUID();
        User user = baseApprovedUser(id);
        user.setRole(Role.DRIVER);
        user.setLicenseNumber("DL123456");
        user.setLicenseExpiryDate(java.time.LocalDate.parse("2030-05-01"));
        user.setCertifications("Hazmat");
        user.setExperienceYears(8);

        UpdateUserRequest req = new UpdateUserRequest();
        req.setRole(Role.SYSTEM_USER);
        req.setEmployeeId("EMP001");
        req.setDepartment("Operations");
        req.setOfficeLocation("Colombo");
        req.setDesignation("Coordinator");

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        adminUserService.updateUser(id, req);

        assertEquals(Role.SYSTEM_USER, user.getRole());
        assertNull(user.getLicenseNumber());
        assertNull(user.getLicenseExpiryDate());
        assertNull(user.getCertifications());
        assertNull(user.getExperienceYears());
        assertEquals("EMP001", user.getEmployeeId());
        assertEquals("Operations", user.getDepartment());
    }

    private static User basePendingUser(UUID id) {
        return User.builder()
                .id(id)
                .fullName("Test User")
                .email("test@vfms.com")
                .nic("123456789")
                .role(Role.SYSTEM_USER)
                .status(UserStatus.PENDING_APPROVAL)
                .build();
    }

    private static User baseApprovedUser(UUID id) {
        return User.builder()
                .id(id)
                .fullName("Approved User")
                .email("approved@vfms.com")
                .nic("123456789")
                .role(Role.SYSTEM_USER)
                .status(UserStatus.APPROVED)
                .build();
    }
}

