package com.vfms.admin.service;

import com.vfms.admin.dto.CreateEmployeeRegistryRequest;
import com.vfms.admin.dto.EmployeeRegistrySummaryResponse;
import com.vfms.common.exception.ValidationException;
import com.vfms.employee.entity.EmployeeRegistryRecord;
import com.vfms.employee.repository.EmployeeRegistryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminEmployeeRegistryService {

    private final EmployeeRegistryRepository employeeRegistryRepository;

    public List<EmployeeRegistrySummaryResponse> getAllRecords() {
        return employeeRegistryRepository.findAll().stream()
                .sorted(Comparator.comparing(EmployeeRegistryRecord::getEmployeeId))
                .map(this::toSummary)
                .toList();
    }

    @Transactional
    public EmployeeRegistrySummaryResponse createRecord(CreateEmployeeRegistryRequest request) {
        String employeeId = normalizeIdentifier(request.getEmployeeId());
        String email = normalizeEmail(request.getEmail());

        if (employeeRegistryRepository.findByEmployeeIdIgnoreCase(employeeId).isPresent()) {
            throw new ValidationException("Validation failed", Map.of(
                    "employeeId", "A company staff record with this employee ID already exists."
            ));
        }

        if (employeeRegistryRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ValidationException("Validation failed", Map.of(
                    "email", "A company staff record with this email already exists."
            ));
        }

        EmployeeRegistryRecord record = EmployeeRegistryRecord.builder()
                .employeeId(employeeId)
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(normalizePhone(request.getPhone()))
                .nic(normalizeNic(request.getNic()))
                .department(request.getDepartment().trim())
                .designation(request.getDesignation().trim())
                .officeLocation(request.getOfficeLocation().trim())
                .active(true)
                .build();

        return toSummary(employeeRegistryRepository.save(record));
    }

    private EmployeeRegistrySummaryResponse toSummary(EmployeeRegistryRecord record) {
        return EmployeeRegistrySummaryResponse.builder()
                .id(record.getId())
                .employeeId(record.getEmployeeId())
                .fullName(record.getFullName())
                .email(record.getEmail())
                .phone(record.getPhone())
                .nic(record.getNic())
                .department(record.getDepartment())
                .designation(record.getDesignation())
                .officeLocation(record.getOfficeLocation())
                .active(record.isActive())
                .build();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String normalizeIdentifier(String value) {
        return value == null ? null : value.trim().toUpperCase();
    }

    private String normalizeNic(String value) {
        return value == null ? null : value.trim().replaceAll("\\s+", "").toUpperCase();
    }

    private String normalizePhone(String value) {
        return value == null ? null : value.trim().replaceAll("\\s+", "");
    }
}
