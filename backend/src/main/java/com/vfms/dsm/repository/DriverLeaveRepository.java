package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DriverLeaveRepository extends JpaRepository<DriverLeave, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "driver")
    List<DriverLeave> findByDriverIdOrderByCreatedAtDesc(UUID driverId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "driver")
    List<DriverLeave> findByStatusOrderByCreatedAtDesc(DriverLeave.LeaveStatus status);

    @Query("SELECT l FROM DriverLeave l WHERE l.status = 'APPROVED' AND l.endDate = :today")
    List<DriverLeave> findLeavesEndingToday(@Param("today") LocalDate today);

    @Query("SELECT COUNT(l) FROM DriverLeave l WHERE l.driver.id = :driverId " +
           "AND l.status NOT IN :excludedStatuses " +
           "AND l.startDate <= :endDate AND l.endDate >= :startDate")
    long countOverlappingLeaves(@Param("driverId") UUID driverId, 
                                @Param("startDate") LocalDate startDate, 
                                @Param("endDate") LocalDate endDate,
                                @Param("excludedStatuses") List<DriverLeave.LeaveStatus> excludedStatuses);

    @Query("SELECT COUNT(l) > 0 FROM DriverLeave l WHERE l.driver.id = :driverId " +
           "AND l.status = 'APPROVED' AND l.startDate <= :date AND l.endDate >= :date")
    boolean hasApprovedLeaveOnDate(@Param("driverId") UUID driverId, @Param("date") LocalDate date);
}
