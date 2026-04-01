package com.vfms.dsm.repository;

import com.vfms.dsm.entity.StaffServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffServiceRequestRepository extends JpaRepository<StaffServiceRequest, Long> {
    List<StaffServiceRequest> findByStaffId(Long staffId);
    List<StaffServiceRequest> findByStatus(StaffServiceRequest.RequestStatus status);
}
