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

    /**
     * Admin creates a new user (Invite flow).
     */
    /**
     * Admin creates a new user (Auto-generate credentials).
     */
    public AuthenticationResponse signup(RegisterRequest request) {
        // Auto-generate company email: name.role@fleetpro.com (simplified)
        String sanitizedName = request.getName().toLowerCase().replaceAll("\\s+", ".");
        String generatedEmail = sanitizedName + "." + request.getRole().name().toLowerCase() + "@fleetpro.com";
        // Ensure uniqueness (simple append for MVP)
        if (repository.findByEmail(generatedEmail).isPresent()) {
            generatedEmail = sanitizedName + "." + request.getRole().name().toLowerCase() + (int)(Math.random() * 1000) + "@fleetpro.com";
        }

        // Auto-generate password
        String generatedPassword = "Pass" + (int)(Math.random() * 10000) + "!";

        var user = User.builder()
                .name(request.getName())
                .email(generatedEmail)
                .role(request.getRole())
                .emailVerified(true) // Admin verified
                .passwordChangeRequired(true) // Force change on first login
                .password(passwordEncoder.encode(generatedPassword))
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

    public void verifyEmail(String token) {
        // Legacy or future self-signup flow
    }

    public AuthenticationResponse setPassword(String token, String newPassword) {
        // Legacy or future flow
        return null;
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        
        // No email verification check needed for this flow as admin creates verified users
        
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
        
        user.setPasswordResetToken(java.util.UUID.randomUUID().toString());
        user.setPasswordResetTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
        repository.save(user);
        
        // TODO: Send email
    }

    public void resetPassword(String token, String newPassword) {
        var user = repository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getPasswordResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

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
