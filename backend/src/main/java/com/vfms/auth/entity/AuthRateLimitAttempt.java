package com.vfms.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(
        name = "auth_rate_limit_attempts",
        indexes = {
                @Index(name = "idx_auth_rate_limit_key_time", columnList = "rate_key, attempted_at"),
                @Index(name = "idx_auth_rate_limit_attempted_at", columnList = "attempted_at")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRateLimitAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rate_key", nullable = false, length = 180)
    private String rateKey;

    @Column(name = "attempted_at", nullable = false)
    private Instant attemptedAt;
}
