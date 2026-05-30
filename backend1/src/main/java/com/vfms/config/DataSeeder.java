package com.vfms.config;

import com.vfms.admin.config.AdminSeedProperties;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.employee.repository.EmployeeRegistryRepository;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Creates the initial administrator account on startup only when:
 * - admin seeding is enabled
 * - no active admin account already exists
 *
 * Seed values come from {@code vfms.admin.seed.*} properties, which can be
 * overridden by environment variables for each deployment environment.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private static final String SYSTEM_ACTOR = "system";

    private final UserRepository userRepository;
    private final EmployeeRegistryRepository employeeRegistryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSeedProperties adminSeedProperties;

    @Override
    public void run(ApplicationArguments args) {
        logEmployeeRegistryState();

        if (!adminSeedProperties.isEnabled()) {
            log.info("[SEED] Admin seeding disabled - skipping.");
            return;
        }

        if (!hasCompleteAdminSeedConfiguration()) {
            log.warn("[SEED] Admin seeding enabled but configuration is incomplete - skipping.");
            return;
        }

        if (adminSeedProperties.isCleanupDemoUsers()) {
            cleanupDemoUsers();
        }

        seedAdminUser();
    }

    private void seedAdminUser() {
        if (userRepository.existsByRoleAndDeletedAtIsNull(Role.ADMIN)) {
            log.info("[SEED] Admin user already exists - skipping seed.");
            return;
        }

        User admin = User.builder()
                .fullName(adminSeedProperties.getFullName())
                .email(normalizeEmail(adminSeedProperties.getEmail()))
                .password(passwordEncoder.encode(adminSeedProperties.getPassword()))
                .phone(adminSeedProperties.getPhone())
                .nic(adminSeedProperties.getNic())
                .role(Role.ADMIN)
                .status(UserStatus.APPROVED)
                .emailVerified(true)
                .createdByAdmin(true)
                .enabled(true)
                .passwordChangeRequired(true)
                .createdBy(SYSTEM_ACTOR)
                .build();

        userRepository.save(admin);

        log.info(
                "[SEED] Default admin created - email: {}, password change required on first login.",
                admin.getEmail()
        );
    }

    private void cleanupDemoUsers() {
        String protectedEmail = normalizeEmail(adminSeedProperties.getEmail());
        List<User> activeUsers = userRepository.findByDeletedAtIsNullOrderByCreatedAtDesc();
        int cleaned = 0;

        for (User user : activeUsers) {
            if (protectedEmail.equals(normalizeEmail(user.getEmail()))) {
                continue;
            }

            user.setStatusBeforeDeletion(user.getStatus());
            user.setDeletedAt(LocalDateTime.now());
            user.setDeletedBy(SYSTEM_ACTOR);
            user.setDeletedReason("Demo user cleanup");
            user.setStatus(UserStatus.DEACTIVATED);
            user.setEnabled(false);
            userRepository.save(user);
            cleaned++;
        }

        if (cleaned > 0) {
            log.info("[SEED] Soft-deleted {} demo user account(s). Protected admin: {}", cleaned, protectedEmail);
        } else {
            log.info("[SEED] No demo user accounts required cleanup.");
        }
    }

    private void logEmployeeRegistryState() {
        long registryCount = employeeRegistryRepository.count();
        if (registryCount == 0) {
            log.info(
                    "[SEED] Employee registry is empty. Add real staff records via CSV import template at src/main/resources/data/employee-registry.csv."
            );
            return;
        }

        log.info("[SEED] Employee registry contains {} active staff record(s).", registryCount);
    }

    /**
     * Ensures the optional bootstrap account is only created when all required
     * seed values are supplied through configuration.
     */
    private boolean hasCompleteAdminSeedConfiguration() {
        return isConfigured(adminSeedProperties.getEmail())
                && isConfigured(adminSeedProperties.getPassword())
                && isConfigured(adminSeedProperties.getFullName())
                && isConfigured(adminSeedProperties.getPhone())
                && isConfigured(adminSeedProperties.getNic());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private boolean isConfigured(String value) {
        return value != null && !value.isBlank();
    }
}
