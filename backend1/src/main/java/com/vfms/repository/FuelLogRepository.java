package com.vfms.repository;

import com.vfms.entity.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {

    @Query("SELECT SUM(f.totalCost) FROM FuelLog f")
    Double getTotalFuelSpend();

    @Query("SELECT SUM(f.fuelQuantity) FROM FuelLog f")
    Double getTotalFuelConsumption();

    List<FuelLog> findByDateBetween(LocalDate startDate, LocalDate endDate);
}