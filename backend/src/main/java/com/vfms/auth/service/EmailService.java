package com.vfms.auth.service;

import com.vfms.common.exception.ValidationException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@vfms.com}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String token) {
        String verifyUrl = frontendUrl + "/auth/verify-email?token=" + token;
        sendHtmlEmail(
                toEmail,
                "Verify Your VFMS Email Address",
                buildEmailLayout(
                        fullName,
                        "Verify Your Email",
                        "<p>Thank you for registering with VFMS.</p>"
                                + "<p>Please confirm your email address to continue.</p>"
                                + buildPrimaryButton("Verify Email", verifyUrl)
                                + "<p>This verification link expires in 24 hours.</p>")
        );
    }

    @Async
    public void sendApprovalEmail(String toEmail, String fullName, String roleName) {
        String loginUrl = frontendUrl + "/auth/login";
        sendHtmlEmail(
                toEmail,
                "Your VFMS Account Has Been Approved",
                buildEmailLayout(
                        fullName,
                        "Account Approved",
                        "<p>Your account has been approved as <strong>"
                                + escape(roleName.replace("_", " "))
                                + "</strong>.</p>"
                                + "<p>You can now sign in and start using the platform.</p>"
                                + buildPrimaryButton("Sign In", loginUrl))
        );
    }

    @Async
    public void sendRejectionEmail(String toEmail, String fullName, String reason) {
        String rejectionHtml = (reason == null || reason.isBlank())
                ? ""
                : "<p><strong>Reason:</strong> " + escape(reason) + "</p>";
        sendHtmlEmail(
                toEmail,
                "Your VFMS Registration Was Not Approved",
                buildEmailLayout(
                        fullName,
                        "Registration Update",
                        "<p>We could not approve your registration at this time.</p>"
                                + rejectionHtml
                                + "<p>If you need help, please contact the administrator.</p>")
        );
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String token) {
        String resetUrl = frontendUrl + "/auth/reset-password?token=" + token;
        sendHtmlEmail(
                toEmail,
                "Reset Your VFMS Password",
                buildEmailLayout(
                        fullName,
                        "Reset Password",
                        "<p>We received a request to reset your password.</p>"
                                + buildPrimaryButton("Reset Password", resetUrl)
                                + "<p>This link expires in 1 hour.</p>"
                                + "<p>If you did not request this, you can ignore this email.</p>")
        );
    }

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        sendHtmlEmail(
                toEmail,
                "VFMS Email Verification Code",
                buildEmailLayout(
                        "there",
                        "Verification Code",
                        "<p>Use the code below to verify your email address:</p>"
                                + "<div style='margin:24px 0;text-align:center;'>"
                                + "<span style='display:inline-block;padding:14px 24px;"
                                + "background:#f5f7fb;border:1px solid #d0d5dd;border-radius:12px;"
                                + "font-size:28px;font-weight:700;letter-spacing:6px;color:#0b1736;'>"
                                + escape(otp)
                                + "</span></div>"
                                + "<p>This code expires in 5 minutes.</p>")
        );
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String fullName, String roleName, String tempPassword) {
        sendHtmlEmail(
                toEmail,
                "Welcome to VFMS",
                buildEmailLayout(
                        fullName,
                        "Your Account Is Ready",
                        "<p>An administrator created a VFMS account for you as <strong>"
                                + escape(roleName.replace("_", " "))
                                + "</strong>.</p>"
                                + "<p><strong>Email:</strong> " + escape(toEmail) + "</p>"
                                + "<p><strong>Temporary password:</strong> "
                                + "<code style='background:#f5f7fb;padding:4px 8px;border-radius:6px;'>"
                                + escape(tempPassword)
                                + "</code></p>"
                                + "<p>Please sign in and change your password immediately.</p>"
                                + buildPrimaryButton("Open Login", frontendUrl + "/auth/login"))
        );
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            throw new ValidationException("Failed to send email to " + to + ". Please try again later.", e);
        }
    }

    private String buildEmailLayout(String name, String heading, String content) {
        return "<!DOCTYPE html>"
                + "<html><body style='margin:0;padding:32px;background:#eef2f7;font-family:Segoe UI,Arial,sans-serif;'>"
                + "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;"
                + "border:1px solid #d0d5dd;overflow:hidden;'>"
                + "<div style='background:#0b1736;padding:24px 32px;'>"
                + "<h1 style='margin:0;color:#f4b400;font-size:22px;'>VFMS</h1>"
                + "</div>"
                + "<div style='padding:32px;color:#101828;'>"
                + "<p style='margin-top:0;color:#667085;'>Hello " + escape(name) + ",</p>"
                + "<h2 style='margin:0 0 16px 0;'>" + escape(heading) + "</h2>"
                + content
                + "</div>"
                + "<div style='padding:16px 32px;background:#f9fafb;color:#98a2b3;font-size:12px;'>"
                + "This is an automated message from VFMS. Please do not reply."
                + "</div>"
                + "</div></body></html>";
    }

    private String buildPrimaryButton(String label, String url) {
        return "<div style='margin:24px 0;'>"
                + "<a href='" + escape(url) + "' style='display:inline-block;padding:14px 24px;"
                + "background:#f4b400;color:#0b1736;text-decoration:none;border-radius:10px;font-weight:700;'>"
                + escape(label)
                + "</a></div>";
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
