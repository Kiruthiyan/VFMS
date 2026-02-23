package com.vfms.auth.service;

import com.vfms.auth.dto.AuthenticationRequest;
import com.vfms.auth.dto.AuthenticationResponse;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.model.User;
import com.vfms.auth.repository.UserRepository;
import com.vfms.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // Temporary OTP storage for email verification (before user creation)
    private final java.util.Map<String, String[]> pendingEmailVerifications = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Sends an OTP to the given email to verify it's real before creating a user.
     */
    public void sendVerificationCode(String email) {
        // Check if email already exists in system
        if (repository.findByEmail(email).isPresent()) {
            throw new RuntimeException("An account with this email already exists");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        String expiry = String.valueOf(System.currentTimeMillis() + 15 * 60 * 1000); // 15 mins
        pendingEmailVerifications.put(email, new String[] { otp, expiry });

        String htmlContent = """
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
                """
                .formatted(otp);

        emailService.sendEmail(email, "Your VFMS Email Verification Code", htmlContent);
    }

    /**
     * Verifies the OTP sent to the email before user creation.
     */
    public void verifyEmailOtp(String email, String otp) {
        String[] data = pendingEmailVerifications.get(email);
        if (data == null) {
            throw new RuntimeException("No verification code found for this email. Please request a new one.");
        }
        String storedOtp = data[0];
        long expiry = Long.parseLong(data[1]);
        if (!storedOtp.equals(otp)) {
            throw new RuntimeException("Invalid verification code.");
        }
        if (System.currentTimeMillis() > expiry) {
            pendingEmailVerifications.remove(email);
            throw new RuntimeException("Verification code has expired. Please request a new one.");
        }
        // Mark as verified but keep in map so signup can confirm it was verified
        pendingEmailVerifications.put(email, new String[] { "VERIFIED", data[1] });
    }

    /**
     * Admin creates a new user. Temp password is emailed directly to the user.
     */
    public AuthenticationResponse signup(RegisterRequest request) {
        // Check if email already exists
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Auto-generate a secure temporary password
        String generatedPassword = "Temp" + (int) (Math.random() * 9000 + 1000) + "!";

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(request.getRole())
                .emailVerified(true)
                .passwordChangeRequired(true)
                .password(passwordEncoder.encode(generatedPassword))
                .joinedDate(java.time.LocalDate.now())
                .status("ACTIVE")
                .build();

        repository.save(user);

        // Clean up verification entry
        pendingEmailVerifications.remove(request.getEmail());

        // Email temp password directly to the new user (never shown to admin)
        String welcomeHtml = """
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
                """
                .formatted(user.getName(), user.getEmail(), generatedPassword);

        emailService.sendEmail(user.getEmail(), "Your VFMS Account Credentials", welcomeHtml);

        // Return response WITHOUT the generated password
        return AuthenticationResponse.builder()
                .token(null)
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .id(user.getId())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .id(user.getId())
                .passwordChangeRequired(user.getPasswordChangeRequired())
                .build();
    }

    public void forgotPassword(String email) {
        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        user.setPasswordResetToken(otp);
        user.setPasswordResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15)); // 15 mins expiry
        repository.save(user);

        // Send Email with OTP
        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #0f172a; text-align: center;">Password Reset Code</h2>
                    <p style="color: #64748b; font-size: 16px;">Hello %s,</p>
                    <p style="color: #64748b; font-size: 16px;">You requested to reset your password. Use the following code to verify your identity:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f1f5f9; color: #0f172a; padding: 12px 24px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 5px; border: 1px solid #cbd5e1;">%s</span>
                    </div>
                    <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 15 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="color: #cbd5e1; font-size: 12px; text-align: center;">VFMS - Vehicle Fleet Management System</p>
                </div>
                """
                .formatted(user.getName(), otp);

        emailService.sendEmail(user.getEmail(), "Your Verification Code - VFMS", htmlContent);
    }

    public void verifyOtp(String email, String otp) {
        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("=== OTP Verification Debug ===");
        System.out.println("Email: " + email);
        System.out.println("Entered OTP: [" + otp + "]");
        System.out.println("Stored OTP: [" + user.getPasswordResetToken() + "]");
        System.out.println(
                "OTP Match: " + (user.getPasswordResetToken() != null && user.getPasswordResetToken().equals(otp)));
        System.out.println("Token Expiry: " + user.getPasswordResetTokenExpiry());
        System.out.println("Current Time: " + java.time.LocalDateTime.now());
        System.out.println("Is Expired: " + (user.getPasswordResetTokenExpiry() != null
                && user.getPasswordResetTokenExpiry().isBefore(java.time.LocalDateTime.now())));
        System.out.println("============================");

        if (user.getPasswordResetToken() == null || !user.getPasswordResetToken().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getPasswordResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }
    }

    public void resetPassword(String email, String otp, String newPassword) {
        verifyOtp(email, otp); // Re-verify before resetting

        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        repository.save(user);
    }

    public void changePassword(Integer userId, String newPassword) {
        var user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(false);
        repository.save(user);
    }
}
