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

    private static final String SUBJECT_APPROVAL = "VFMS - Your Account Has Been Approved";
    private static final String SUBJECT_REJECTION = "VFMS - Account Registration Update";
    private static final String SUBJECT_VERIFY = "VFMS - Verify Your Email";
    private static final String SUBJECT_WELCOME = "VFMS - Welcome! Your Account Has Been Created";

    private static final String COLOR_PRIMARY_DARK = "#0B1736";
    private static final String COLOR_PRIMARY_ACCENT = "#F4B400";
    private static final String COLOR_BG_LIGHT = "#F5F7FB";
    private static final String COLOR_BG_WHITE = "#fff";
    private static final String COLOR_BORDER_LIGHT = "#E4E7EC";
    private static final String COLOR_TEXT_MUTED = "#667085";
    private static final String COLOR_TEXT_DARK = "#101828";
    private static final String COLOR_WARNING = "#F79009";
    private static final String COLOR_FOOTER_BG = "#F9FAFC";
    private static final String COLOR_FOOTER_TEXT = "#98A2B3";
    private static final String COLOR_CODE_BG = "#FEF3C7";

    @Value("${spring.mail.username:noreply@vfms.com}")
    private String fromEmail;

    // ── APPROVAL EMAIL ───────────────────────────────────────────────────

    public void sendApprovalEmail(String email, String fullName, String roleName) {
        String subject = SUBJECT_APPROVAL;
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
        String subject = SUBJECT_REJECTION;
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
        String subject = SUBJECT_VERIFY;
        String body = buildHtmlEmail(
                "User",
                "Verify Your Email Address",
                "<p>Please use the following code to verify your email address:</p>"
                + "<div style='text-align:center; margin:24px 0;'>"
                + "<span style='font-size:32px; font-weight:bold; letter-spacing:8px; "
            + "color:" + COLOR_PRIMARY_DARK + "; background:" + COLOR_BG_LIGHT + "; padding:12px 24px; border-radius:8px;'>"
                + verificationToken + "</span></div>"
                + "<p>This code expires in 2 minutes.</p>"
        );
        sendEmail(email, subject, body);
    }

    // ── WELCOME EMAIL (Admin-created users) ──────────────────────────────

    public void sendWelcomeEmail(String email, String fullName,
                                  String roleName, String tempPassword) {
        String subject = SUBJECT_WELCOME;
        String body = buildHtmlEmail(
                fullName,
                "Welcome to VFMS!",
                "<p>An administrator has created a VFMS account for you with the role: "
                + "<strong>" + roleName + "</strong>.</p>"
            + "<div style='background:" + COLOR_BG_LIGHT + "; border:1px solid " + COLOR_BORDER_LIGHT + "; "
                + "border-radius:8px; padding:16px; margin:16px 0;'>"
            + "<p style='margin:0 0 8px 0; font-size:13px; color:" + COLOR_TEXT_MUTED + ";'>Your login credentials:</p>"
                + "<p style='margin:0;'><strong>Email:</strong> " + email + "</p>"
                + "<p style='margin:4px 0 0 0;'><strong>Temporary Password:</strong> "
            + "<code style='background:" + COLOR_CODE_BG + "; padding:2px 8px; border-radius:4px; "
                + "font-size:14px; font-weight:bold;'>" + tempPassword + "</code></p>"
                + "</div>"
            + "<p style='color:" + COLOR_WARNING + "; font-weight:500;'>"
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
                + "background-color:" + COLOR_BG_LIGHT + ";'>"
                + "<div style='max-width:560px; margin:32px auto; "
                + "background:" + COLOR_BG_WHITE + "; border-radius:12px; overflow:hidden; "
                + "border:1px solid " + COLOR_BORDER_LIGHT + "; box-shadow:0 2px 8px rgba(0,0,0,0.06);'>"
                // Header
                + "<div style='background:" + COLOR_PRIMARY_DARK + "; padding:24px 32px;'>"
                + "<h1 style='margin:0; color:" + COLOR_PRIMARY_ACCENT + "; font-size:20px; "
                + "font-weight:700;'>VFMS</h1>"
                + "</div>"
                // Body
                + "<div style='padding:32px;'>"
                + "<p style='margin:0 0 4px 0; font-size:14px; color:" + COLOR_TEXT_MUTED + ";'>"
                + "Hello " + recipientName + ",</p>"
                + "<h2 style='margin:8px 0 16px 0; font-size:18px; color:" + COLOR_TEXT_DARK + ";'>"
                + heading + "</h2>"
                + contentHtml
                + "</div>"
                // Footer
                + "<div style='background:" + COLOR_FOOTER_BG + "; border-top:1px solid " + COLOR_BORDER_LIGHT + "; "
                + "padding:16px 32px;'>"
                + "<p style='margin:0; font-size:11px; color:" + COLOR_FOOTER_TEXT + ";'>"
                + "This is an automated message from VFMS. Please do not reply.</p>"
                + "</div>"
                + "</div></body></html>";
    }
}
