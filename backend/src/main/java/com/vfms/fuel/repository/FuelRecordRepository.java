package com.vfms.fuel.repository;

import com.vfms.fuel.entity.FuelRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface FuelRecordRepository extends JpaRepository<FuelRecord, UUID> {

    List<FuelRecord> findByVehicleIdOrderByFuelDateDesc(Long vehicleId);

    List<FuelRecord> findByDriverIdOrderByFuelDateDesc(UUID driverId);

    List<FuelRecord> findAllByOrderByFuelDateDesc();

    @Query("SELECT f FROM FuelRecord f WHERE f.vehicle.id = :vehicleId " +
           "AND f.fuelDate BETWEEN :from AND :to ORDER BY f.fuelDate ASC")
    List<FuelRecord> findByVehicleAndDateRange(
            @Param("vehicleId") Long vehicleId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT f FROM FuelRecord f WHERE f.fuelDate BETWEEN :from AND :to " +
           "ORDER BY f.fuelDate ASC")
    List<FuelRecord> findByDateRange(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT f FROM FuelRecord f WHERE f.driver.id = :driverId " +
           "AND f.fuelDate BETWEEN :from AND :to ORDER BY f.fuelDate ASC")
    List<FuelRecord> findByDriverAndDateRange(
            @Param("driverId") UUID driverId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT f FROM FuelRecord f WHERE f.vehicle.id = :vehicleId " +
           "ORDER BY f.fuelDate DESC, f.createdAt DESC")
    List<FuelRecord> findLatestByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT COUNT(f) FROM FuelRecord f WHERE f.vehicle.id = :vehicleId " +
           "AND f.fuelDate = :date")
    long countByVehicleAndDate(
            @Param("vehicleId") Long vehicleId,
            @Param("date") LocalDate date);

    List<FuelRecord> findByFlaggedForMisuseTrue();

    @Query("SELECT f FROM FuelRecord f WHERE f.flaggedForMisuse = true " +
           "ORDER BY f.fuelDate DESC")
    List<FuelRecord> findAllFlaggedRecords();
}
