package com.vfms.user.repository;

import com.vfms.common.enums.UserStatus;
import com.vfms.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    List<User> findByStatus(UserStatus status);
    
    List<User> findByStatusOrderByCreatedAtAsc(UserStatus status);
    
    List<User> findByRole(String role);
}
