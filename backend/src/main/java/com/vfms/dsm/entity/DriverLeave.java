package com.vfms.dsm.entity;

import com.vfms.user.entity.User;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "driver_leaves")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverLeave extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @JsonIgnore
    public User getDriver() {
        return this.user;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false)
    private LeaveType leaveType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private LeaveStatus status = LeaveStatus.PENDING;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approval_notes")
    private String approvalNotes;

    public enum LeaveType {
        ANNUAL,
        MEDICAL,
        EMERGENCY,
        UNPAID
    }

    public enum LeaveStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED
    }

    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty("driver")
    public java.util.Map<String, String> getDriverSummary() {
        if (user != null) {
            return java.util.Map.of(
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "employeeId", user.getEmployeeId() != null ? user.getEmployeeId() : ""
            );
        }
        return null;
    }
}
