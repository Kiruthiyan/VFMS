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

    /**
     * Admin creates a new user (Auto-generate credentials).
     */
    public AuthenticationResponse signup(RegisterRequest request) {
        // Check if email already exists
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Auto-generate password
        String generatedPassword = "Temp" + (int) (Math.random() * 10000) + "!";

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail()) // Use provided email
                .phone(request.getPhone()) // Use provided phone
                .role(request.getRole())
                .emailVerified(true) // Admin verified
                .passwordChangeRequired(true) // Force change on first login
                .password(passwordEncoder.encode(generatedPassword))
                .joinedDate(java.time.LocalDate.now())
                .status("ACTIVE")
                .build();

        repository.save(user);

        return AuthenticationResponse.builder()
                .token(null) // No token, just credentials
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .id(user.getId())
                .generatedPassword(generatedPassword) // Return for Admin to see
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
