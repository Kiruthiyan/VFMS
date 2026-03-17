package com.vfms.auth.repository;

import com.vfms.auth.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    Optional<User> findByPasswordResetToken(String token);

    /**
     * Find all active users
     */
    List<User> findByStatusTrue();

    /**
     * Find all active users with pagination
     */
    Page<User> findByStatusTrue(Pageable pageable);

    /**
     * Find active users by role
     */
    List<User> findByRoleAndStatusTrue(String role);
}
