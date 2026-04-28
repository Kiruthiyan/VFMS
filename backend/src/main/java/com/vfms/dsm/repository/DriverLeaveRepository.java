package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DriverLeaveRepository extends JpaRepository<DriverLeave, Long> {

    List<DriverLeave> findByDriverIdOrderByCreatedAtDesc(UUID driverId);

    List<DriverLeave> findByStatusOrderByCreatedAtDesc(DriverLeave.LeaveStatus status);

    @Query("SELECT l FROM DriverLeave l WHERE l.status = 'APPROVED' AND l.endDate = :today")
    List<DriverLeave> findLeavesEndingToday(@Param("today") LocalDate today);
}
