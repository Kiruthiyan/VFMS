package com.vfms.fuel.repository;

import com.vfms.fuel.model.FuelRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuelRepository extends JpaRepository<FuelRecord, Integer> {
    List<FuelRecord> findByVehiclePlate(String vehiclePlate);

    /**
     * Find fuel records by vehicle plate with pagination
     */
    Page<FuelRecord> findByVehiclePlate(String vehiclePlate, Pageable pageable);
}
