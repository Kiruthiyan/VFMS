package com.vfms.repository;

import com.vfms.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @Query("SELECT COUNT(v) FROM Vehicle v")
    long getTotalVehicles();

    @Query("SELECT SUM(v.totalDistance) FROM Vehicle v")
    Double getTotalFleetDistance();
}
