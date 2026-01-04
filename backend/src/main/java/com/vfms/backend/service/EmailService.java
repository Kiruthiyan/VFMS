package com.vfms.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    public void sendVerificationEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Verify Your Email - VFMS");
        message.setText("Please click the following link to verify your email:\n\n" +
                baseUrl + "/auth/verify-email?token=" + token);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Reset Your Password - VFMS");
        message.setText("Please click the following link to reset your password:\n\n" +
                baseUrl + "/auth/reset-password?token=" + token + "\n\n" +
                "This link will expire in 1 hour.");
        mailSender.send(message);
    }
}

