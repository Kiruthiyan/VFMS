package com.vfms.auth.service;

<<<<<<< HEAD
import com.vfms.common.exception.ValidationException;
import jakarta.mail.internet.MimeMessage;
=======
>>>>>>> origin/feature/user-management
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
<<<<<<< HEAD
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email service for sending transactional emails
 * Handles: verification, approval, rejection, password reset, and OTP emails
 * Throws exceptions on failures - never silently fails
 */
=======
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

>>>>>>> origin/feature/user-management
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

<<<<<<< HEAD
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ── PUBLIC METHODS ────────────────────────────────────────────────────

    /**
     * Sends email verification link
     * Async to prevent blocking user registration flow
     */
    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String token) {
        String verifyUrl = frontendUrl + "/auth/verify-email?token=" + token;
        String subject = "Verify Your VFMS Email Address";
        sendHtmlEmail(toEmail, subject, verificationEmailHtml(fullName, verifyUrl));
    }

    /**
     * Sends account approval notification
     * Async to prevent blocking admin approval flow
     */
    @Async
    public void sendApprovalEmail(String toEmail, String fullName, String roleName) {
        String loginUrl = frontendUrl + "/auth/login";
        String displayRole = roleName.replace("_", " ");
        String subject = "Your VFMS Account Has Been Approved";
        sendHtmlEmail(toEmail, subject, approvalEmailHtml(fullName, displayRole, loginUrl));
    }

    /**
     * Sends registration rejection notification
     * Async to prevent blocking admin rejection flow
     */
    @Async
    public void sendRejectionEmail(String toEmail, String fullName, String reason) {
        String subject = "Your VFMS Registration Was Not Approved";
        sendHtmlEmail(toEmail, subject, rejectionEmailHtml(fullName, reason));
    }

    /**
     * Sends password reset link
     * Async to prevent blocking forgot password flow
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String token) {
        String resetUrl = frontendUrl + "/auth/reset-password?token=" + token;
        String subject = "Reset Your VFMS Password";
        sendHtmlEmail(toEmail, subject, passwordResetEmailHtml(fullName, resetUrl));
    }

    /**
     * Sends OTP verification code
     * Async to prevent blocking OTP request flow
     */
    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "VFMS Email Verification Code";
        sendHtmlEmail(toEmail, subject, otpEmailHtml(otp));
    }

    // ── PRIVATE SEND ──────────────────────────────────────────────────────

    /**
     * Internal method to send HTML email
     * Throws exception on failure - never silently fails
     * This ensures callers know if email delivery failed
     * 
     * @param to recipient email address
     * @param subject email subject
     * @param htmlBody email content in HTML format
     * @throws ValidationException if email sending fails
     */
    private void sendHtmlEmail(String to, String subject, String htmlBody) {
=======
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
>>>>>>> origin/feature/user-management
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
<<<<<<< HEAD
            
            log.info("Email sent successfully to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            // Throw exception so caller knows email delivery failed
            throw new ValidationException(
                "Failed to send email to " + to + ". Please try again later.",
                e
            );
        }
    }

    // ── EMAIL TEMPLATES ───────────────────────────────────────────────────

    private String verificationEmailHtml(String name, String verifyUrl) {
        return "<!DOCTYPE html><html><body style='font-family:sans-serif;"
                + "background:#0f172a;padding:40px;margin:0'>"
                + "<div style='max-width:520px;margin:0 auto;background:#1e293b;"
                + "border-radius:16px;padding:40px;border:1px solid #334155'>"
                + "<div style='display:flex;align-items:center;gap:12px;margin-bottom:32px'>"
                + "<div style='width:40px;height:40px;background:#f59e0b;border-radius:10px;"
                + "display:flex;align-items:center;justify-content:center;"
                + "font-size:18px;font-weight:900;color:#0f172a'>V</div>"
                + "<span style='color:#f1f5f9;font-size:18px;font-weight:800;"
                + "letter-spacing:-0.5px'>FLEET<span style='color:#f59e0b'>PRO</span></span></div>"
                + "<h2 style='color:#f1f5f9;margin:0 0 8px'>Verify Your Email</h2>"
                + "<p style='color:#94a3b8;margin:0 0 24px'>Hi " + name + ",</p>"
                + "<p style='color:#94a3b8;line-height:1.6;margin:0 0 28px'>"
                + "Thank you for registering with the Vehicle Fleet Management System. "
                + "Please verify your email address to proceed.</p>"
                + "<a href='" + verifyUrl + "' style='display:inline-block;"
                + "padding:14px 32px;background:#f59e0b;color:#0f172a;border-radius:10px;"
                + "text-decoration:none;font-weight:700;font-size:15px'>Verify Email Address</a>"
                + "<p style='color:#475569;font-size:13px;margin-top:28px'>"
                + "This link expires in 24 hours. If you did not register, ignore this email.</p>"
                + "</div></body></html>";
    }

    private String approvalEmailHtml(String name, String displayRole, String loginUrl) {
        return "<!DOCTYPE html><html><body style='font-family:sans-serif;"
                + "background:#0f172a;padding:40px;margin:0'>"
                + "<div style='max-width:520px;margin:0 auto;background:#1e293b;"
                + "border-radius:16px;padding:40px;border:1px solid #334155'>"
                + "<div style='display:flex;align-items:center;gap:12px;margin-bottom:32px'>"
                + "<div style='width:40px;height:40px;background:#f59e0b;border-radius:10px;"
                + "display:flex;align-items:center;justify-content:center;"
                + "font-size:18px;font-weight:900;color:#0f172a'>V</div>"
                + "<span style='color:#f1f5f9;font-size:18px;font-weight:800;"
                + "letter-spacing:-0.5px'>FLEET<span style='color:#f59e0b'>PRO</span></span></div>"
                + "<h2 style='color:#f1f5f9;margin:0 0 8px'>Account Approved</h2>"
                + "<p style='color:#94a3b8;margin:0 0 24px'>Hi " + name + ",</p>"
                + "<p style='color:#94a3b8;line-height:1.6;margin:0 0 8px'>"
                + "Your VFMS account has been approved as</p>"
                + "<p style='color:#f59e0b;font-size:18px;font-weight:700;"
                + "margin:0 0 28px'>" + displayRole + "</p>"
                + "<a href='" + loginUrl + "' style='display:inline-block;"
                + "padding:14px 32px;background:#16a34a;color:#fff;border-radius:10px;"
                + "text-decoration:none;font-weight:700;font-size:15px'>Sign In Now</a>"
                + "<p style='color:#475569;font-size:13px;margin-top:28px'>"
                + "If you have any questions, contact your administrator.</p>"
                + "</div></body></html>";
    }

    private String rejectionEmailHtml(String name, String reason) {
        return "<!DOCTYPE html><html><body style='font-family:sans-serif;"
                + "background:#0f172a;padding:40px;margin:0'>"
                + "<div style='max-width:520px;margin:0 auto;background:#1e293b;"
                + "border-radius:16px;padding:40px;border:1px solid #334155'>"
                + "<div style='display:flex;align-items:center;gap:12px;margin-bottom:32px'>"
                + "<div style='width:40px;height:40px;background:#f59e0b;border-radius:10px;"
                + "display:flex;align-items:center;justify-content:center;"
                + "font-size:18px;font-weight:900;color:#0f172a'>V</div>"
                + "<span style='color:#f1f5f9;font-size:18px;font-weight:800;"
                + "letter-spacing:-0.5px'>FLEET<span style='color:#f59e0b'>PRO</span></span></div>"
                + "<h2 style='color:#f1f5f9;margin:0 0 8px'>Registration Not Approved</h2>"
                + "<p style='color:#94a3b8;margin:0 0 24px'>Hi " + name + ",</p>"
                + "<p style='color:#94a3b8;line-height:1.6;margin:0 0 20px'>"
                + "We regret to inform you that your VFMS registration was not approved.</p>"
                + (reason != null && !reason.isBlank()
                ? "<div style='background:#450a0a;border:1px solid #7f1d1d;border-radius:10px;"
                + "padding:16px;margin-bottom:20px'>"
                + "<p style='color:#fca5a5;margin:0;font-size:14px'>"
                + "<strong>Reason:</strong> " + reason + "</p></div>"
                : "")
                + "<p style='color:#94a3b8;line-height:1.6;margin:0 0 8px'>"
                + "If you believe this is an error, you may submit a new registration request "
                + "or contact your administrator directly.</p>"
                + "<p style='color:#475569;font-size:13px;margin-top:24px'>"
                + "Thank you for your interest in VFMS.</p>"
                + "</div></body></html>";
    }

    private String passwordResetEmailHtml(String name, String resetUrl) {
        return "<!DOCTYPE html><html><body style='font-family:sans-serif;"
                + "background:#0f172a;padding:40px;margin:0'>"
                + "<div style='max-width:520px;margin:0 auto;background:#1e293b;"
                + "border-radius:16px;padding:40px;border:1px solid #334155'>"
                + "<div style='display:flex;align-items:center;gap:12px;"
                + "margin-bottom:32px'>"
                + "<div style='width:40px;height:40px;background:#f59e0b;"
                + "border-radius:10px;display:flex;align-items:center;"
                + "justify-content:center;font-size:18px;font-weight:900;"
                + "color:#0f172a'>V</div>"
                + "<span style='color:#f1f5f9;font-size:18px;font-weight:800;"
                + "letter-spacing:-0.5px'>FLEET"
                + "<span style='color:#f59e0b'>PRO</span></span></div>"
                + "<h2 style='color:#f1f5f9;margin:0 0 8px'>Reset Your Password</h2>"
                + "<p style='color:#94a3b8;margin:0 0 24px'>Hi " + name + ",</p>"
                + "<p style='color:#94a3b8;line-height:1.6;margin:0 0 28px'>"
                + "We received a request to reset your password. "
                + "Click the button below to set a new password. "
                + "This link expires in <strong style='color:#f1f5f9'>"
                + "1 hour</strong>.</p>"
                + "<a href='" + resetUrl
                + "' style='display:inline-block;padding:14px 32px;"
                + "background:#f59e0b;color:#0f172a;border-radius:10px;"
                + "text-decoration:none;font-weight:700;font-size:15px'>"
                + "Reset Password</a>"
                + "<p style='color:#475569;font-size:13px;margin-top:28px'>"
                + "If you did not request a password reset, "
                + "you can safely ignore this email. "
                + "Your password will not change.</p>"
                + "</div></body></html>";
    }

    private String otpEmailHtml(String otp) {
        return "<!DOCTYPE html><html><body style='font-family:sans-serif;"
                + "background:#0f172a;padding:40px;margin:0'>"
                + "<div style='max-width:520px;margin:0 auto;background:#1e293b;"
                + "border-radius:16px;padding:40px;border:1px solid #334155'>"
                + "<div style='display:flex;align-items:center;gap:12px;margin-bottom:32px'>"
                + "<div style='width:40px;height:40px;background:#f59e0b;border-radius:10px;"
                + "display:flex;align-items:center;justify-content:center;"
                + "font-size:18px;font-weight:900;color:#0f172a'>V</div>"
                + "<span style='color:#f1f5f9;font-size:18px;font-weight:800;"
                + "letter-spacing:-0.5px'>FLEET<span style='color:#f59e0b'>PRO</span></span></div>"
                + "<h2 style='color:#f1f5f9;margin:0 0 8px'>Email Verification Code</h2>"
                + "<p style='color:#94a3b8;margin:0 0 24px'>Hi there,</p>"
                + "<p style='color:#94a3b8;line-height:1.6;margin:0 0 28px'>"
                + "Your email verification code is:</p>"
                + "<div style='background:#0f172a;border:2px solid #f59e0b;border-radius:10px;"
                + "padding:20px;text-align:center;margin-bottom:28px'>"
                + "<p style='color:#f59e0b;font-size:32px;font-weight:900;margin:0;letter-spacing:4px'>"
                + otp + "</p></div>"
                + "<p style='color:#94a3b8;line-height:1.6;margin:0 0 28px'>"
                + "This code expires in 5 minutes. Do not share this code with anyone.</p>"
                + "<p style='color:#475569;font-size:13px;margin-top:28px'>"
                + "If you did not request this code, you can safely ignore this email.</p>"
=======
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
>>>>>>> origin/feature/user-management
                + "</div></body></html>";
    }
}
