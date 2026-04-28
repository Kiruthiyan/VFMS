package com.vfms.dsm.repository;

import com.vfms.dsm.entity.StaffServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StaffServiceRequestRepository extends JpaRepository<StaffServiceRequest, Long> {
    List<StaffServiceRequest> findByStaffIdOrderByCreatedAtDesc(Long staffId);
    List<StaffServiceRequest> findByStatusOrderByCreatedAtDesc(StaffServiceRequest.RequestStatus status);

    @Query("select distinct r.vehicleId from StaffServiceRequest r where r.vehicleId is not null order by r.vehicleId")
    List<Long> findDistinctVehicleIds();
}
