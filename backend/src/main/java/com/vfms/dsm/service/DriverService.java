package com.vfms.dsm.service;

import com.vfms.dsm.dto.*;
import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.mapper.DriverMapper;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.dsm.exception.DuplicateResourceException;
import com.vfms.dsm.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverService {
    private final DriverRepository driverRepository;
    private final DriverMapper driverMapper;

    public DriverResponse createDriver(DriverRequest request) {
        // Enforce uniqueness before mapping so the API returns a clear business-rule violation.
        if (driverRepository.existsByEmployeeId(request.getEmployeeId()))
            throw new DuplicateResourceException("Employee ID already exists");
        if (driverRepository.existsByNic(request.getNic()))
            throw new DuplicateResourceException("NIC already exists");
        Driver driver = driverMapper.toEntity(request);
        if (driver == null) {
            throw new IllegalArgumentException("Failed to map driver request to entity");
        }
        return driverMapper.toResponse(driverRepository.save(driver));
    }

    @Transactional(readOnly = true)
    public DriverResponse getDriver(UUID id) {
        return driverMapper.toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<DriverResponse> getAllDrivers(Pageable pageable) {
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }
        // Fall back to newest-first ordering when the client does not supply an explicit sort.
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt")
        );
        return driverRepository.findAll(sortedPageable).map(driverMapper::toResponse);
    }

    public DriverResponse updateDriver(UUID id, DriverRequest request) {
        Driver driver = findById(id);
        // Apply incoming fields onto the managed entity, then persist the merged state.
        driverMapper.updateEntity(driver, request);
        if (driver == null) {
            throw new IllegalArgumentException("Failed to update driver entity");
        }
        return driverMapper.toResponse(driverRepository.save(driver));
    }

    public void deactivateDriver(UUID id) {
        Driver driver = findById(id);
        // Deactivation is modeled as a status change instead of deleting historical records.
        driver.setStatus(Driver.DriverStatus.INACTIVE);
        driverRepository.save(driver);
    }

    public void updateStatus(UUID id, Driver.DriverStatus status) {
        Driver driver = findById(id);
        // This endpoint lets the UI switch a driver between allowed workflow states.
        driver.setStatus(status);
        driverRepository.save(driver);
    }

    public Driver findById(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Driver id cannot be null");
        }
        return driverRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
    }
}
