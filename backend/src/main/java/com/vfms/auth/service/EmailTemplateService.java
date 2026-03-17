package com.vfms.auth.service;

import org.springframework.stereotype.Service;

/**
 * Service for managing email templates.
 * Centralizes all email HTML templates to avoid hardcoding in services.
 */
@Service
public class EmailTemplateService {

    /**
     * Get email verification code template
     * 
     * @param otp the one-time password to include in the email
     * @return the HTML email template
     */
    public String getVerificationCodeTemplate(String otp) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="background: #0f172a; color: #fbbf24; display: inline-block; padding: 10px 20px; border-radius: 8px; font-size: 20px; font-weight: 900; letter-spacing: 2px;">FLEETPRO</div>
                    </div>
                    <h2 style="color: #0f172a; text-align: center; margin-bottom: 8px;">Email Verification</h2>
                    <p style="color: #64748b; font-size: 15px; text-align: center; margin-bottom: 30px;">An administrator is adding you to the VFMS system. Please share the code below with them to verify your email address.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f1f5f9; color: #0f172a; padding: 16px 32px; font-size: 32px; letter-spacing: 10px; font-weight: bold; border-radius: 8px; border: 2px solid #cbd5e1; display: inline-block;">%s</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; text-align: center;">This code expires in <strong>15 minutes</strong>. If you didn't expect this email, you can ignore it.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
                    <p style="color: #cbd5e1; font-size: 12px; text-align: center;">VFMS – Vehicle Fleet Management System</p>
                </div>
                """.formatted(otp);
    }

    /**
     * Get welcome/account creation email template
     * 
     * @param firstName user's first name
     * @param email user's email address
     * @param temporaryPassword auto-generated temporary password
     * @return the HTML email template
     */
    public String getWelcomeEmailTemplate(String firstName, String email, String temporaryPassword) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="background: #0f172a; color: #fbbf24; display: inline-block; padding: 10px 20px; border-radius: 8px; font-size: 20px; font-weight: 900; letter-spacing: 2px;">FLEETPRO</div>
                    </div>
                    <h2 style="color: #0f172a; text-align: center;">Welcome to VFMS, %s!</h2>
                    <p style="color: #64748b; font-size: 15px;">Your account has been created by an administrator. Use the credentials below to log in for the first time.</p>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Login URL</p>
                        <p style="margin: 0 0 20px 0; font-weight: bold; color: #0f172a;">http://localhost:3000/auth/login</p>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Email</p>
                        <p style="margin: 0 0 20px 0; font-weight: bold; color: #0f172a;">%s</p>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Temporary Password</p>
                        <p style="margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: 4px; font-family: monospace;">%s</p>
                    </div>
                    <p style="color: #ef4444; font-size: 13px; font-weight: 600;">⚠️ You will be prompted to set a new password on first login. Please do not share this temporary password.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
                    <p style="color: #cbd5e1; font-size: 12px; text-align: center;">VFMS – Vehicle Fleet Management System</p>
                </div>
                """.formatted(firstName, email, temporaryPassword);
    }

    /**
     * Get password reset code email template
     * 
     * @param firstName user's first name
     * @param resetCode the password reset OTP
     * @return the HTML email template
     */
    public String getPasswordResetTemplate(String firstName, String resetCode) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="background: #0f172a; color: #fbbf24; display: inline-block; padding: 10px 20px; border-radius: 8px; font-size: 20px; font-weight: 900; letter-spacing: 2px;">FLEETPRO</div>
                    </div>
                    <h2 style="color: #0f172a; text-align: center;">Password Reset Code</h2>
                    <p style="color: #64748b; font-size: 16px;">Hello %s,</p>
                    <p style="color: #64748b; font-size: 16px;">You requested to reset your password. Use the following code to verify your identity:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f1f5f9; color: #0f172a; padding: 12px 24px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 5px; border: 1px solid #cbd5e1;">%s</span>
                    </div>
                    <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 15 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="color: #cbd5e1; font-size: 12px; text-align: center;">VFMS – Vehicle Fleet Management System</p>
                </div>
                """.formatted(firstName, resetCode);
    }

    /**
     * Get password changed confirmation email template
     * 
     * @param firstName user's first name
     * @return the HTML email template
     */
    public String getPasswordChangedTemplate(String firstName) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="background: #0f172a; color: #fbbf24; display: inline-block; padding: 10px 20px; border-radius: 8px; font-size: 20px; font-weight: 900; letter-spacing: 2px;">FLEETPRO</div>
                    </div>
                    <h2 style="color: #0f172a; text-align: center;">Password Changed Successfully</h2>
                    <p style="color: #64748b; font-size: 16px;">Hello %s,</p>
                    <p style="color: #64748b; font-size: 16px;">Your password has been changed successfully. If you did not make this change, please contact your administrator immediately.</p>
                    <div style="background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 24px 0;">
                        <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0;">✓ Your account is secure. Your new password is now active.</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
                    <p style="color: #cbd5e1; font-size: 12px; text-align: center;">VFMS – Vehicle Fleet Management System</p>
                </div>
                """.formatted(firstName);
    }

}
