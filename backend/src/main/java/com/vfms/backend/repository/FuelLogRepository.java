package com.vfms.backend.repository;

import com.vfms.backend.entity.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {
    List<FuelLog> findByVehicleId(Long vehicleId);
    List<FuelLog> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT f FROM FuelLog f WHERE f.vehicleId = :vehicleId AND YEAR(f.date) = :year AND MONTH(f.date) = :month")
    List<FuelLog> findByVehicleIdAndMonth(@Param("vehicleId") Long vehicleId, @Param("year") int year, @Param("month") int month);
    
    @Query("SELECT f FROM FuelLog f WHERE YEAR(f.date) = :year AND MONTH(f.date) = :month")
    List<FuelLog> findByMonth(@Param("year") int year, @Param("month") int month);
}

