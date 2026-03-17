package com.vfms.auth.service;

import com.vfms.auth.dto.AuthenticationRequest;
import com.vfms.auth.dto.AuthenticationResponse;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.model.User;
import com.vfms.auth.repository.UserRepository;
import com.vfms.auth.security.JwtService;
import com.vfms.auth.util.PasswordValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final SecureRandom secureRandom = new SecureRandom();

    // Temporary OTP storage for email verification (before user creation)
    private final java.util.Map<String, String[]> pendingEmailVerifications = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Generate cryptographically secure 6-digit OTP
     */
    private String generateSecureOtp() {
        return String.format("%06d", secureRandom.nextInt(1000000));
    }

    /**
     * Sends an OTP to the given email to verify it's real before creating a user.
     */
    public void sendVerificationCode(String email) {
        // Check if email already exists in system
        if (repository.findByEmail(email).isPresent()) {
            throw new RuntimeException("An account with this email already exists");
        }

        // Generate 6-digit OTP using secure random
        String otp = generateSecureOtp();
        String expiry = String.valueOf(System.currentTimeMillis() + 15 * 60 * 1000); // 15 mins
        pendingEmailVerifications.put(email, new String[] { otp, expiry });

        String htmlContent = emailTemplateService.getVerificationCodeTemplate(otp);

        emailService.sendEmail(email, "Your VFMS Email Verification Code", htmlContent);
        log.info("Verification code sent to email: {}", email);
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

        // Ensure email was OTP-verified before allowing account creation
        String[] verificationData = pendingEmailVerifications.get(request.getEmail());
        if (verificationData == null) {
            throw new RuntimeException("Email verification is required before creating this account");
        }
        long verificationExpiry = Long.parseLong(verificationData[1]);
        if (System.currentTimeMillis() > verificationExpiry) {
            pendingEmailVerifications.remove(request.getEmail());
            throw new RuntimeException("Email verification has expired. Please request a new code.");
        }
        if (!"VERIFIED".equals(verificationData[0])) {
            throw new RuntimeException("Email verification is incomplete. Please verify the OTP first.");
        }

        // Auto-generate a secure temporary password
        String generatedPassword = "Temp" + (secureRandom.nextInt(9000) + 1000) + "!";

        var user = User.builder()
                .firstName(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhone())
                .role(request.getRole())
                .emailVerified(true)
                .passwordChangeRequired(true)
                .password(passwordEncoder.encode(generatedPassword))
                .joinedDate(java.time.LocalDate.now())
                .status(true)
                .build();

        repository.save(user);

        // Clean up verification entry
        pendingEmailVerifications.remove(request.getEmail());

        // Email temp password directly to the new user (never shown to admin)
        String welcomeHtml = emailTemplateService.getWelcomeEmailTemplate(
                user.getFirstName(), 
                user.getEmail(), 
                generatedPassword
        );

        emailService.sendEmail(user.getEmail(), "Your VFMS Account Credentials", welcomeHtml);

        // Return response WITHOUT the generated password
        return AuthenticationResponse.builder()
                .token(null)
                .role(user.getRole().name())
                .name(user.getFirstName())
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
                .name(user.getFirstName())
                .email(user.getEmail())
                .id(user.getId())
                .passwordChangeRequired(user.getPasswordChangeRequired())
                .build();
    }

    public void forgotPassword(String email) {
        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        // Generate 6-digit OTP using secure random
        String otp = generateSecureOtp();

        user.setPasswordResetToken(otp);
        user.setPasswordResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15)); // 15 mins expiry
        repository.save(user);

        // Send Email with OTP using template service
        String htmlContent = emailTemplateService.getPasswordResetTemplate(user.getFirstName(), otp);

        emailService.sendEmail(user.getEmail(), "Your Verification Code - VFMS", htmlContent);
    }

    public void verifyOtp(String email, String otp) {
        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.debug("OTP Verification - Email: {}, Token expiry: {}, Current time: {}", 
                email, user.getPasswordResetTokenExpiry(), java.time.LocalDateTime.now());

        if (user.getPasswordResetToken() == null || !user.getPasswordResetToken().equals(otp)) {
            log.warn("Invalid OTP attempt for email: {}", email);
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getPasswordResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            log.warn("Expired OTP attempt for email: {}", email);
            throw new RuntimeException("OTP has expired");
        }
        
        log.info("OTP verified successfully for email: {}", email);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        verifyOtp(email, otp); // Re-verify before resetting

        // Validate password meets complexity requirements
        PasswordValidator.validatePassword(newPassword);

        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        repository.save(user);
        
        log.info("Password reset successfully for user: {}", email);
    }

    public void changePassword(Integer userId, String newPassword) {
        // Validate password meets complexity requirements
        PasswordValidator.validatePassword(newPassword);

        var user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(false);
        repository.save(user);
        
        // Send password changed confirmation email
        String htmlContent = emailTemplateService.getPasswordChangedTemplate(user.getFirstName());
        emailService.sendEmail(user.getEmail(), "Password Changed - VFMS", htmlContent);
        
        log.info("Password changed successfully for user ID: {}", userId);
    }
}
