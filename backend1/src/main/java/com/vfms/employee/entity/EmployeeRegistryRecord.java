package com.vfms.employee.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "employee_registry")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRegistryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "employee_id", nullable = false, unique = true)
    private String employeeId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String nic;

    @Column(nullable = false)
    private String phone;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String designation;

    @Column(name = "office_location", nullable = false)
    private String officeLocation;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @PrePersist
    @PreUpdate
    void normalize() {
        if (employeeId != null) {
            employeeId = employeeId.trim().toUpperCase();
        }
        if (email != null) {
            email = email.trim().toLowerCase();
        }
        if (nic != null) {
            nic = nic.trim().replaceAll("\\s+", "").toUpperCase();
        }
        if (phone != null) {
            phone = phone.trim().replaceAll("\\s+", "");
        }
        if (fullName != null) {
            fullName = fullName.trim();
        }
        if (department != null) {
            department = department.trim();
        }
        if (designation != null) {
            designation = designation.trim();
        }
        if (officeLocation != null) {
            officeLocation = officeLocation.trim();
        }
    }
}
