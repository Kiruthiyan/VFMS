package com.vfms.repository;

import com.vfms.entity.RentalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RentalRepository extends JpaRepository<RentalRecord, Long> {

    @Query("SELECT SUM(r.totalCost) FROM RentalRecord r WHERE r.status = 'Completed'")
    Double getTotalRevenue();
}
