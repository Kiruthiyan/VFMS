package com.vfms.vehicle.entity;

import com.vfms.common.enums.VehicleStatus;
import com.vfms.common.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String plateNumber;

    @Column(nullable = false)
    private String make;

    @Column(nullable = false)
    private String model;

<<<<<<< HEAD
    @Column(nullable = false)
=======
    @Column(nullable = false, name = "vehicle_year")
>>>>>>> origin/feature/user-management
    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Column(precision = 5, scale = 2)
    private BigDecimal fuelLevel;

    @Column(name = "odometer_reading")
    private Double odometerReading;

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
