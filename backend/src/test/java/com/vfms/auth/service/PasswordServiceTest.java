package com.vfms.auth.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import java.lang.reflect.Field;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for EmailService.
 *
 * Validates core email flows used by the user management lifecycle:
 * approval, rejection, verification, and admin-created welcome email.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService Unit Tests")
class PasswordServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    @DisplayName("Should send approval email")
    void testSendApprovalEmail() throws Exception {
        // Given
        prepareMailSender();

        // When
        emailService.sendApprovalEmail("approved@vfms.com", "Test User", "SYSTEM_USER");

        // Then
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should send rejection email")
    void testSendRejectionEmail() throws Exception {
        // Given
        prepareMailSender();

        // When
        emailService.sendRejectionEmail("rejected@vfms.com", "Test User", "Incomplete profile");

        // Then
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should send verification email")
    void testSendVerificationEmail() throws Exception {
        // Given
        prepareMailSender();

        // When
        emailService.sendVerificationEmail("verify@vfms.com", "123456");

        // Then
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should send welcome email")
    void testSendWelcomeEmail() throws Exception {
        // Given
        prepareMailSender();

        // When
        emailService.sendWelcomeEmail(
                "welcome@vfms.com",
                "Test User",
                "APPROVER",
                "TempPass123!");

        // Then
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    private void prepareMailSender() throws Exception {
        MimeMessage message = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(message);

        Field fromEmailField = EmailService.class.getDeclaredField("fromEmail");
        fromEmailField.setAccessible(true);
        fromEmailField.set(emailService, "noreply@vfms.com");
    }
}
