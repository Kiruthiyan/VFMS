package com.vfms.rental;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalRepository extends JpaRepository<RentalRecord, Long> {
    List<RentalRecord> findByStatus(RentalStatus status);

    List<RentalRecord> findByVendorId(Long vendorId);
}
