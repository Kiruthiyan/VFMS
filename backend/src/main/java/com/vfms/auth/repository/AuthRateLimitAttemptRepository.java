package com.vfms.auth.repository;

import com.vfms.auth.entity.AuthRateLimitAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Repository
public interface AuthRateLimitAttemptRepository extends JpaRepository<AuthRateLimitAttempt, Long> {

    long countByRateKeyAndAttemptedAtAfter(String rateKey, Instant windowStart);

    @Modifying
    @Transactional
    void deleteByAttemptedAtBefore(Instant cutoff);
}
