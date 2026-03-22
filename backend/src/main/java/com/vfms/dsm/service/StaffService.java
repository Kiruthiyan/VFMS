package com.vfms.dsm.service;

import static java.util.Objects.requireNonNull;

import com.vfms.dsm.dto.*;
import com.vfms.dsm.entity.Staff;
import com.vfms.dsm.exception.ResourceNotFoundException;
import com.vfms.dsm.exception.DuplicateResourceException;
import com.vfms.dsm.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor @Transactional
public class StaffService {
    private final StaffRepository staffRepository;

    public StaffResponse createStaff(@NonNull StaffRequest request) {
        if (staffRepository.existsByEmployeeId(request.getEmployeeId()))
            throw new DuplicateResourceException("Employee ID already exists");
        Staff staff = Staff.builder()
            .employeeId(request.getEmployeeId())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .nic(request.getNic())
            .email(request.getEmail())
            .phone(request.getPhone())
            .department(request.getDepartment())
            .designation(request.getDesignation())
            .dateOfJoining(request.getDateOfJoining())
            .role(request.getRole() != null ? request.getRole() : Staff.StaffRole.SYSTEM_USER)
            .build();
        Staff saved = staffRepository.save(requireNonNull(staff));
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public StaffResponse getStaff(@NonNull Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<StaffResponse> getAllStaff(@NonNull Pageable pageable) {
        return staffRepository.findAll(pageable).map(this::toResponse);
    }

    public StaffResponse updateStaff(@NonNull Long id, @NonNull StaffRequest request) {
        Staff staff = findById(id);
        staff.setFirstName(request.getFirstName());
        staff.setLastName(request.getLastName());
        staff.setEmail(request.getEmail());
        staff.setPhone(request.getPhone());
        staff.setDepartment(request.getDepartment());
        staff.setDesignation(request.getDesignation());
        if (request.getRole() != null) staff.setRole(request.getRole());
        return toResponse(staffRepository.save(staff));
    }

    public void deactivateStaff(@NonNull Long id) {
        Staff staff = findById(id);
        staff.setStatus(Staff.StaffStatus.INACTIVE);
        staffRepository.save(staff);
    }

    public Staff findById(@NonNull Long id) {
        return staffRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found: " + id));
    }

    private StaffResponse toResponse(Staff s) {
        return StaffResponse.builder()
            .id(s.getId()).employeeId(s.getEmployeeId())
            .firstName(s.getFirstName()).lastName(s.getLastName())
            .nic(s.getNic()).email(s.getEmail()).phone(s.getPhone())
            .department(s.getDepartment()).designation(s.getDesignation())
            .dateOfJoining(s.getDateOfJoining()).role(s.getRole())
            .status(s.getStatus()).createdAt(s.getCreatedAt())
            .build();
    }
}
