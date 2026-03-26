package com.vfms.auth.repository;

import com.vfms.auth.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    /**
     * Find OTP by email
     */
    Optional<OtpVerification> findByEmail(String email);

    /**
     * Delete OTP by email
     */
    void deleteByEmail(String email);

    /**
     * Delete all expired OTPs
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpVerification o WHERE o.expiryTime < :now")
    void deleteExpiredOtps(@Param("now") Instant now);

    /**
     * Check if email has a verified OTP
     */
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM OtpVerification o WHERE o.email = :email AND o.verified = true")
    boolean existsVerifiedOtpForEmail(@Param("email") String email);
}
