package com.vfms.trip.repository;

import com.vfms.trip.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    @Query("SELECT t FROM Trip t WHERE t.driver.email = :email ORDER BY t.scheduledTime DESC")
    List<Trip> findByDriverEmail(@Param("email") String email);

    List<Trip> findByStatus(String status);
}
