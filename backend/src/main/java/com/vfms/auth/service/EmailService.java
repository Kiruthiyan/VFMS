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

/**
 * Email service for sending transactional emails
 * Handles: verification, approval, rejection, password reset, and OTP emails
 * Throws exceptions on failures - never silently fails
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

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
     * Synchronous to ensure API can report delivery failures immediately
     */
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
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            
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
                + "</div></body></html>";
    }
}
