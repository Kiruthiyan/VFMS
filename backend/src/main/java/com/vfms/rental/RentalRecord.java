package com.vfms.rental;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "rental_records")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RentalRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(nullable = false)
    private String vehicleType;

    @Column(nullable = false)
    private String plateNumber;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false)
    private BigDecimal costPerDay;

    private BigDecimal totalCost;

    private String purpose;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RentalStatus status = RentalStatus.ACTIVE;

    private String agreementUrl;
    private String invoiceUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void calculateTotalCost() {
        if (startDate != null && endDate != null && costPerDay != null) {
            long days = ChronoUnit.DAYS.between(startDate, endDate);
            if (days < 1) days = 1;
            this.totalCost = costPerDay.multiply(BigDecimal.valueOf(days));
        }
    }
}

