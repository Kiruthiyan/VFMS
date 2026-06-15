package com.vfms.user.repository;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.fuel.dto.FuelMetadataDriverProjection;
import com.vfms.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmployeeId(String employeeId);

    boolean existsByRoleAndDeletedAtIsNull(Role role);

    boolean existsByEmail(String email);

    List<User> findByDeletedAtIsNullOrderByCreatedAtDesc();

    List<User> findByStatusAndDeletedAtIsNullOrderByCreatedAtAsc(UserStatus status);

    boolean existsByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmployeeIdAndDeletedAtIsNull(String employeeId);

    boolean existsByEmailAndDeletedAtIsNullAndIdNot(String email, UUID id);

    boolean existsByEmployeeIdAndDeletedAtIsNullAndIdNot(String employeeId, UUID id);

    long countByStatusAndDeletedAtIsNull(UserStatus status);

    long countByDeletedAtIsNull();

    long countByDeletedAtIsNotNull();

    long countByRoleAndDeletedAtIsNull(Role role);

    List<User> findByDeletedAtIsNotNullOrderByDeletedAtDesc();

    List<User> findByStatus(UserStatus status);

    List<User> findByStatusOrderByCreatedAtAsc(UserStatus status);

    Page<User> findByRoleAndDeletedAtIsNull(Role role, Pageable pageable);

    List<User> findByRoleInAndDeletedAtIsNull(List<Role> roles);

    @Query("SELECT u.employeeId FROM User u WHERE u.employeeId LIKE :prefix%")
    List<String> findAllEmployeeIdsByPrefix(@org.springframework.data.repository.query.Param("prefix") String prefix);

    @Query("""
            select u.id as id, u.fullName as fullName
            from User u
            where u.role = com.vfms.common.enums.Role.DRIVER
              and u.status = com.vfms.common.enums.UserStatus.APPROVED
              and u.deletedAt is null
            """)
    List<FuelMetadataDriverProjection> findFuelMetadataDrivers();
}
