package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DriverServiceRequestRepository extends JpaRepository<DriverServiceRequest, Long> {
    List<DriverServiceRequest> findByDriver_IdOrderByCreatedAtDesc(UUID driverId);
    List<DriverServiceRequest> findByStatusOrderByCreatedAtDesc(DriverServiceRequest.RequestStatus status);
}