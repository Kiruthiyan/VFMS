package com.vfms.employee.repository;

import com.vfms.employee.entity.EmployeeRegistryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRegistryRepository extends JpaRepository<EmployeeRegistryRecord, UUID> {

    Optional<EmployeeRegistryRecord> findByEmailIgnoreCase(String email);

    List<EmployeeRegistryRecord> findAllByEmailIgnoreCase(String email);

    Optional<EmployeeRegistryRecord> findByEmployeeIdIgnoreCase(String employeeId);

    List<EmployeeRegistryRecord> findAllByEmployeeIdIgnoreCase(String employeeId);
}
