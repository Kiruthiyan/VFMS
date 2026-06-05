package com.vfms.repository;

import com.vfms.entity.TripRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TripRequestRepository extends JpaRepository<TripRequest, UUID> {
}
