package com.vfms.fuel.repository;

import com.vfms.fuel.model.FuelRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuelRepository extends JpaRepository<FuelRecord, Integer> {
    List<FuelRecord> findByVehicleId(Integer vehicleId);
}
