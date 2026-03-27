package com.vfms.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@vfms.com}")
    private String fromEmail;

    // ── APPROVAL EMAIL ───────────────────────────────────────────────────

    public void sendApprovalEmail(String email, String fullName, String roleName) {
        String subject = "VFMS – Your Account Has Been Approved";
        String body = buildHtmlEmail(
                fullName,
                "Your VFMS account has been approved!",
                "<p>Congratulations! Your account has been approved as <strong>"
                + roleName + "</strong>.</p>"
                + "<p>You can now log in to the system using your registered email and password.</p>"
        );
        sendEmail(email, subject, body);
    }

    // ── REJECTION EMAIL ──────────────────────────────────────────────────

    public void sendRejectionEmail(String email, String fullName, String rejectionReason) {
        String subject = "VFMS – Account Registration Update";
        String body = buildHtmlEmail(
                fullName,
                "Account Registration Update",
                "<p>We regret to inform you that your account registration has not been approved.</p>"
                + "<p><strong>Reason:</strong> " + rejectionReason + "</p>"
                + "<p>If you believe this is an error, please contact the system administrator.</p>"
        );
        sendEmail(email, subject, body);
    }

    // ── VERIFICATION EMAIL ───────────────────────────────────────────────

    public void sendVerificationEmail(String email, String verificationToken) {
        String subject = "VFMS – Verify Your Email";
        String body = buildHtmlEmail(
                "User",
                "Verify Your Email Address",
                "<p>Please use the following code to verify your email address:</p>"
                + "<div style='text-align:center; margin:24px 0;'>"
                + "<span style='font-size:32px; font-weight:bold; letter-spacing:8px; "
                + "color:#0B1736; background:#F5F7FB; padding:12px 24px; border-radius:8px;'>"
                + verificationToken + "</span></div>"
                + "<p>This code expires in 2 minutes.</p>"
        );
        sendEmail(email, subject, body);
    }

    // ── WELCOME EMAIL (Admin-created users) ──────────────────────────────

    public void sendWelcomeEmail(String email, String fullName,
                                  String roleName, String tempPassword) {
        String subject = "VFMS – Welcome! Your Account Has Been Created";
        String body = buildHtmlEmail(
                fullName,
                "Welcome to VFMS!",
                "<p>An administrator has created a VFMS account for you with the role: "
                + "<strong>" + roleName + "</strong>.</p>"
                + "<div style='background:#F5F7FB; border:1px solid #E4E7EC; "
                + "border-radius:8px; padding:16px; margin:16px 0;'>"
                + "<p style='margin:0 0 8px 0; font-size:13px; color:#667085;'>Your login credentials:</p>"
                + "<p style='margin:0;'><strong>Email:</strong> " + email + "</p>"
                + "<p style='margin:4px 0 0 0;'><strong>Temporary Password:</strong> "
                + "<code style='background:#FEF3C7; padding:2px 8px; border-radius:4px; "
                + "font-size:14px; font-weight:bold;'>" + tempPassword + "</code></p>"
                + "</div>"
                + "<p style='color:#F79009; font-weight:500;'>"
                + "⚠️ Please change your password immediately after your first login.</p>"
                + "<p>If you did not expect this email, please contact the system administrator.</p>"
        );
        sendEmail(email, subject, body);
    }

    // ── EMAIL INFRASTRUCTURE ─────────────────────────────────────────────

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("[EMAIL] Sent '{}' to {}", subject, to);
        } catch (MessagingException e) {
            log.error("[EMAIL] Failed to send '{}' to {}: {}",
                    subject, to, e.getMessage());
        }
    }

    private String buildHtmlEmail(String recipientName, String heading,
                                   String contentHtml) {
        return "<!DOCTYPE html>"
                + "<html><head><meta charset='UTF-8'></head>"
                + "<body style='margin:0; padding:0; font-family: -apple-system, "
                + "BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; "
                + "background-color:#F5F7FB;'>"
                + "<div style='max-width:560px; margin:32px auto; "
                + "background:#fff; border-radius:12px; overflow:hidden; "
                + "border:1px solid #E4E7EC; box-shadow:0 2px 8px rgba(0,0,0,0.06);'>"
                // Header
                + "<div style='background:#0B1736; padding:24px 32px;'>"
                + "<h1 style='margin:0; color:#F4B400; font-size:20px; "
                + "font-weight:700;'>VFMS</h1>"
                + "</div>"
                // Body
                + "<div style='padding:32px;'>"
                + "<p style='margin:0 0 4px 0; font-size:14px; color:#667085;'>"
                + "Hello " + recipientName + ",</p>"
                + "<h2 style='margin:8px 0 16px 0; font-size:18px; color:#101828;'>"
                + heading + "</h2>"
                + contentHtml
                + "</div>"
                // Footer
                + "<div style='background:#F9FAFC; border-top:1px solid #E4E7EC; "
                + "padding:16px 32px;'>"
                + "<p style='margin:0; font-size:11px; color:#98A2B3;'>"
                + "This is an automated message from VFMS. Please do not reply.</p>"
                + "</div>"
                + "</div></body></html>";
    }
}
