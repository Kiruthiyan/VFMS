package com.vfms.dsm.service;

import com.vfms.dsm.dto.CertificationRequest;
import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.entity.DriverCertification;
import com.vfms.dsm.exception.ResourceNotFoundException;
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
        Driver driver = driverService.findById(request.getDriverId());
        DriverCertification cert = DriverCertification.builder()
            .driver(driver)
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
        return certRepository.findByDriver_IdOrderByCreatedAtDesc(driverId);
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
