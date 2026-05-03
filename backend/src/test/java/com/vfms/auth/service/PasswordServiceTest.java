package com.vfms.auth.service;

import com.vfms.auth.dto.ChangePasswordRequest;
import com.vfms.auth.entity.PasswordResetToken;
import com.vfms.auth.repository.PasswordResetTokenRepository;
import com.vfms.common.exception.ValidationException;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PasswordService Unit Tests")
class PasswordServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository resetTokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordService passwordService;

    @Test
    @DisplayName("Should reject password change when confirmation does not match")
    void shouldRejectPasswordChangeWhenConfirmationDoesNotMatch() {
        User user = User.builder()
                .email("tester@vfms.com")
                .password("encoded-password")
                .build();

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("Current@123");
        request.setNewPassword("NewSecure@123");
        request.setConfirmPassword("Mismatch@123");

        assertThrows(ValidationException.class, () -> passwordService.changePassword(user, request));
        verifyNoInteractions(passwordEncoder, userRepository, resetTokenRepository, emailService);
    }

    @Test
    @DisplayName("Should reject password change when current password is wrong")
    void shouldRejectPasswordChangeWhenCurrentPasswordIsWrong() {
        User user = User.builder()
                .email("tester@vfms.com")
                .password("encoded-password")
                .build();

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("Wrong@123");
        request.setNewPassword("NewSecure@123");
        request.setConfirmPassword("NewSecure@123");

        when(passwordEncoder.matches("Wrong@123", "encoded-password")).thenReturn(false);

        assertThrows(ValidationException.class, () -> passwordService.changePassword(user, request));
    }
}
