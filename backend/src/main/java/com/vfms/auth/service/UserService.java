package com.vfms.auth.service;

import com.vfms.auth.model.User;
import com.vfms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service layer for User management operations.
 * Provides business logic for CRUD operations, pagination, and soft delete functionality.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository repository;

    /**
     * Get all active users with pagination
     * @param pageable Pagination parameters (page, size, sort)
     * @return Page of active users
     */
    public Page<User> getAllUsersWithPagination(Pageable pageable) {
        log.info("Fetching all active users - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        // Filter for active users only (status = true)
        return repository.findByStatusTrue(pageable);
    }

    /**
     * Get all active users without pagination (backward compatibility)
     * @return List of all active users
     */
    public List<User> getAllUsers() {
        log.info("Fetching all active users (no pagination)");
        return repository.findByStatusTrue();
    }

    /**
     * Get a specific user by ID
     * @param id User ID
     * @return User if found and active
     */
    public User getUserById(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("User ID must be a positive integer");
        }
        log.info("Fetching user with ID: {}", id);
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        // Only return if user is active
        if (user.getStatus() == null || !user.getStatus()) {
            log.warn("User {} found but is inactive", id);
            throw new RuntimeException("User is deactivated");
        }
        
        return user;
    }

    /**
     * Update user information
     * @param id User ID
     * @param userDetails Updated user data
     * @return Updated user
     */
    public User updateUser(Integer id, User userDetails) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("User ID must be a positive integer");
        }

        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (user.getStatus() == null || !user.getStatus()) {
            throw new RuntimeException("Cannot update deactivated user");
        }

        // Only allow updating specific fields
        if (userDetails.getFirstName() != null && !userDetails.getFirstName().trim().isEmpty()) {
            user.setFirstName(userDetails.getFirstName().trim());
        }

        if (userDetails.getLastName() != null && !userDetails.getLastName().trim().isEmpty()) {
            user.setLastName(userDetails.getLastName().trim());
        }

        if (userDetails.getPhoneNumber() != null && !userDetails.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(userDetails.getPhoneNumber().trim());
        }

        if (userDetails.getLicenseNumber() != null && !userDetails.getLicenseNumber().trim().isEmpty()) {
            user.setLicenseNumber(userDetails.getLicenseNumber().trim());
        }

        // Do not allow changing email or password through this endpoint
        
        User saved = repository.save(user);
        log.info("User updated successfully - ID: {}, Email: {}", id, user.getEmail());
        return saved;
    }

    /**
     * Soft delete - mark user as inactive instead of permanent deletion
     * This preserves data integrity and maintains audit trail
     * @param id User ID to deactivate
     */
    public void deactivateUser(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("User ID must be a positive integer");
        }

        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (user.getStatus() == null || !user.getStatus()) {
            log.warn("User {} is already inactive", id);
            throw new RuntimeException("User is already deactivated");
        }

        // Mark user as inactive instead of deleting
        user.setStatus(false);
        repository.save(user);
        
        log.info("User deactivated successfully - ID: {}, Email: {}", id, user.getEmail());
    }

    /**
     * Reactivate a previously deactivated user
     * @param id User ID to reactivate
     */
    public void reactivateUser(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("User ID must be a positive integer");
        }

        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (user.getStatus() != null && user.getStatus()) {
            log.warn("User {} is already active", id);
            throw new RuntimeException("User is already active");
        }

        // Mark user as active
        user.setStatus(true);
        repository.save(user);
        
        log.info("User reactivated successfully - ID: {}, Email: {}", id, user.getEmail());
    }

    /**
     * Check if user exists and is active
     * @param id User ID
     * @return true if user exists and is active
     */
    public boolean isUserActive(Integer id) {
        Optional<User> user = repository.findById(id);
        if (user.isPresent()) {
            Boolean status = user.get().getStatus();
            return status != null && status;
        }
        return false;
    }
}
