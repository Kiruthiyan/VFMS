package com.vfms.dsm.service;

import com.vfms.dsm.dto.DriverResponses.DriverUserResponse;
import com.vfms.dsm.dto.DriverResponses.DriverResponse;
import com.vfms.dsm.dto.DriverRequests.DriverProfileUpdateRequest;
import com.vfms.dsm.entity.DriverAggregate.DriverDocument;
import com.vfms.dsm.mapper.DriverMapper;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.List;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DriverService {
    private final UserRepository userRepository;
    private final DriverMapper driverMapper;
    private final DriverRepository driverRepository;
    private final DriverSupabaseStorageService storageService;

    @Transactional(readOnly = true)
    public Page<DriverUserResponse> getDriverUsers(Pageable pageable) {
        Page<User> users = userRepository.findByRoleAndDeletedAtIsNull(com.vfms.common.enums.Role.DRIVER, pageable);
        return users.map(this::toDriverUserResponse);
    }

    @Transactional(readOnly = true)
    public DriverUserResponse getDriverUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getRole() == com.vfms.common.enums.Role.DRIVER && u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Driver user not found with id: " + userId));
        return toDriverUserResponse(user);
    }

    private DriverUserResponse toDriverUserResponse(User user) {
        return DriverUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .nic(user.getNic())
                .licenseNumber(user.getLicenseNumber())
                .licenseExpiryDate(user.getLicenseExpiryDate())
                .certifications(user.getCertifications())
                .experienceYears(user.getExperienceYears())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .employeeId(user.getEmployeeId())
                .driverId(user.getId()) // driverId is now same as userId
                .ratingPercentage(null) // populated later by Trip Scheduling / Staff Dashboard integration
                .feedbacks(List.of()) // populated later by Trip Scheduling / Staff Dashboard integration
                .build();
    }

    @Transactional(readOnly = true)
    public User findById(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("User id cannot be null");
        }
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No driver profile found for the authenticated user. Please contact an administrator to link your driver record."));
    }

    @Transactional(readOnly = true)
    public DriverResponse getMyProfile(String email) {
        User user = findByEmail(email);
        DriverResponse response = driverMapper.toResponse(user);
        driverRepository.findDocumentsByDriverAndType(user.getId(), DriverDocument.DocumentEntityType.PROFILE)
                .stream()
                .filter(storageService::isSupabaseDocument)
                .findFirst()
                .ifPresent(document -> {
                    try {
                        response.setPhotoUrl(storageService.createSignedUrl(document.getBucketName(), document.getStoragePath()));
                    } catch (ValidationException | ResourceNotFoundException e) {
                        log.warn("Driver profile picture access link could not be created: driverId={}, documentId={}, bucket={}, path={}, reason={}",
                                user.getId(), document.getId(), document.getBucketName(), document.getStoragePath(), e.getMessage());
                    }
                });
        return response;
    }

    public DriverResponse updateMyProfile(String email, DriverProfileUpdateRequest request) {
        User user = findByEmail(email);
        if (request.getFullName() != null && !request.getFullName().isBlank()) user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getEmergencyContactName() != null) user.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) user.setEmergencyContactPhone(request.getEmergencyContactPhone());
        userRepository.save(user);
        return driverMapper.toResponse(user);
    }

    public void removeProfilePicture(String email) {
        User user = findByEmail(email);
        driverRepository.findDocumentsByDriverAndType(user.getId(), DriverDocument.DocumentEntityType.PROFILE)
                .forEach(document -> {
                    if (storageService.isSupabaseDocument(document)) {
                        storageService.deleteObject(document.getBucketName(), document.getStoragePath());
                    }
                    driverRepository.deleteDocument(document);
                });
        user.setPhotoUrl(null);
        userRepository.save(user);
    }
}
