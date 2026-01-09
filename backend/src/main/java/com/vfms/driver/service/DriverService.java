package com.vfms.driver.service;

import com.vfms.auth.model.Role;
import com.vfms.auth.model.User;
import com.vfms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllDrivers() {
        return repository.findAll().stream()
                .filter(user -> user.getRole() == Role.DRIVER)
                .collect(Collectors.toList());
    }

    public User getDriverById(Integer id) {
        return repository.findById(id)
                .filter(user -> user.getRole() == Role.DRIVER)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    public User createDriver(User driver) {
        driver.setRole(Role.DRIVER);
        if (driver.getPassword() == null || driver.getPassword().isEmpty()) {
            driver.setPassword(passwordEncoder.encode("driver123")); // Default password
        } else {
            driver.setPassword(passwordEncoder.encode(driver.getPassword()));
        }
        return repository.save(driver);
    }

    public User updateDriver(Integer id, User driverDetails) {
        User driver = getDriverById(id);
        driver.setName(driverDetails.getName());
        driver.setEmail(driverDetails.getEmail());
        driver.setPhone(driverDetails.getPhone());
        driver.setLicenseNumber(driverDetails.getLicenseNumber());
        driver.setStatus(driverDetails.getStatus());
        driver.setJoinedDate(driverDetails.getJoinedDate());
        driver.setAvatarUrl(driverDetails.getAvatarUrl());
        return repository.save(driver);
    }

    public void deleteDriver(Integer id) {
        repository.deleteById(id);
    }
}
