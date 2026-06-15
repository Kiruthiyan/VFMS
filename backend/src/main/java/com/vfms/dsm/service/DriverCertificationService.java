package com.vfms.dsm.service;

import com.vfms.user.entity.User;

import com.vfms.dsm.dto.CertificationRequest;

import com.vfms.dsm.entity.DriverCertification;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.DriverCertificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverCertificationService {
    private final DriverCertificationRepository certRepository;
    private final DriverService driverService;

    public DriverCertification addCertification(CertificationRequest request) {
        User user = driverService.findById(request.getDriverId());
        DriverCertification cert = DriverCertification.builder()
            .user(user)
            .certType(request.getCertType())
            .certName(request.getCertName())
            .issuedBy(request.getIssuedBy())
            .issueDate(request.getIssueDate())
            .expiryDate(request.getExpiryDate())
            .build();
        return certRepository.save(cert);
    }

    @Transactional(readOnly = true)
    public List<DriverCertification> getCertificationsByDriver(UUID driverId) {
        return certRepository.findByUser_IdOrderByCreatedAtDesc(driverId);
    }

    public DriverCertification updateCertification(Long id, CertificationRequest request) {
        DriverCertification cert = certRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Certification not found: " + id));
        cert.setCertType(request.getCertType());
        cert.setCertName(request.getCertName());
        cert.setIssuedBy(request.getIssuedBy());
        cert.setIssueDate(request.getIssueDate());
        cert.setExpiryDate(request.getExpiryDate());
        return certRepository.save(cert);
    }

    public void deleteCertification(Long id) {
        certRepository.deleteById(id);
    }
}
