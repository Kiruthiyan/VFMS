package com.vfms.dsm.repository;

import com.vfms.dsm.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
}
