package com.vfms.repository;

import com.vfms.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @Query("SELECT SUM(v.totalDistance) FROM Vehicle v")
    Double getTotalFleetDistance();

    @Query("SELECT COUNT(v) FROM Vehicle v")
    Long getTotalVehicles();

    Optional<Vehicle> findByLicensePlate(String licensePlate);
}
