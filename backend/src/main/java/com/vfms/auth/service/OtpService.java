package com.vfms.auth.service;

import com.vfms.auth.entity.OtpVerification;
import com.vfms.auth.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;
    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 2;

    /**
     * Generate and send OTP to email
     */
    @Transactional
    public void sendOtp(String email) {
        try {
            log.info("[OTP-SEND] Starting OTP generation for email: {}", email);
            
            // Find existing OTP and update it, or create new one
            var existingOtp = otpRepository.findByEmail(email);
            
            // Generate 6-digit OTP
            String otp = generateOtp();
            Instant now = Instant.now();
            Instant expiryTime = now.plus(OTP_VALIDITY_MINUTES, ChronoUnit.MINUTES);
            
            log.info("[OTP-SEND] Generated OTP: {}, Validity: {} minutes, Expiry: {}", 
                    otp, OTP_VALIDITY_MINUTES, expiryTime);
            
            OtpVerification otpVerification;
            if (existingOtp.isPresent()) {
                // Update existing OTP
                log.info("[OTP-SEND] Updating existing OTP for email: {}", email);
                otpVerification = existingOtp.get();
                otpVerification.setOtp(otp);
                otpVerification.setExpiryTime(expiryTime);
                otpVerification.setVerified(false);
            } else {
                // Create new OTP
                log.info("[OTP-SEND] Creating new OTP for email: {}", email);
                otpVerification = OtpVerification.builder()
                        .email(email)
                        .otp(otp)
                        .expiryTime(expiryTime)
                        .verified(false)
                        .build();
            }
            
            otpRepository.save(otpVerification);
            log.info("[OTP-SEND] OTP saved successfully for email: {}", email);
            
            // Send OTP via email
            emailService.sendOtpEmail(email, otp);
            log.info("[OTP-SEND] Email sent successfully for: {}", email);
        } catch (Exception e) {
            log.error("[OTP-SEND] Error for email: {}", email, e);
            throw new RuntimeException("Failed to send OTP. Please try again later.", e);
        }
    }

    /**
     * Verify the OTP
     */
    @Transactional
    public boolean verifyOtp(String email, String otp) {
        log.info("[OTP-VERIFY] Verifying OTP for email: {}", email);
        
        OtpVerification otpVerification = otpRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("[OTP-VERIFY] No OTP found for email: {}", email);
                    return new RuntimeException("[NO_OTP] No verification code found for this email. Please request a new code.");
                });

        log.info("[OTP-VERIFY] OTP found. Expiry: {}, Current: {}", otpVerification.getExpiryTime(), Instant.now());

        // Check if OTP is expired
        if (otpVerification.getExpiryTime().isBefore(Instant.now())) {
            log.warn("[OTP-VERIFY] OTP expired for email: {}. Expiry: {}, Current: {}", 
                    email, otpVerification.getExpiryTime(), Instant.now());
            otpRepository.delete(otpVerification);
            throw new RuntimeException("[OTP_EXPIRED] Verification code has expired (valid for 2 minutes). Please request a new code.");
        }

        // Check if OTP matches
        if (!otpVerification.getOtp().equals(otp)) {
            log.warn("[OTP-VERIFY] Invalid OTP for email: {}. Expected: {}, Received: {}", 
                    email, otpVerification.getOtp(), otp);
            throw new RuntimeException("[INVALID_OTP] Verification code is incorrect. Please check and try again.");
        }

        log.info("[OTP-VERIFY] OTP verified successfully for email: {}", email);
        
        // Mark as verified
        otpVerification.setVerified(true);
        otpRepository.save(otpVerification);
        
        return true;
    }

    /**
     * Clean up expired and verified OTPs
     */
    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteExpiredOtps(Instant.now());
    }

    /**
     * Generate random 6-digit OTP
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
