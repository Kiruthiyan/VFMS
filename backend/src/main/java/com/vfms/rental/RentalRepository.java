package com.vfms.rental;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalRepository extends JpaRepository<RentalRecord, Long> {
    List<RentalRecord> findByStatus(RentalStatus status);
    List<RentalRecord> findByVendorId(Long vendorId);
}
