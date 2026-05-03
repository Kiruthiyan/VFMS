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
                .password("encoded-test-password")
                .build();

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("CurrentTestPassword123!");
        request.setNewPassword("NewTestPassword123!");
        request.setConfirmPassword("MismatchTestPassword123!");

        assertThrows(ValidationException.class, () -> passwordService.changePassword(user, request));
        verifyNoInteractions(passwordEncoder, userRepository, resetTokenRepository, emailService);
    }

    @Test
    @DisplayName("Should reject password change when current password is wrong")
    void shouldRejectPasswordChangeWhenCurrentPasswordIsWrong() {
        User user = User.builder()
                .email("tester@vfms.com")
                .password("encoded-test-password")
                .build();

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("WrongTestPassword123!");
        request.setNewPassword("NewTestPassword123!");
        request.setConfirmPassword("NewTestPassword123!");

        when(passwordEncoder.matches("WrongTestPassword123!", "encoded-test-password")).thenReturn(false);

        assertThrows(ValidationException.class, () -> passwordService.changePassword(user, request));
    }
}
