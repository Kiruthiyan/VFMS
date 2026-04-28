package com.vfms.config;

import com.vfms.admin.config.AdminSeedProperties;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
    private final PasswordEncoder passwordEncoder;
    private final AdminSeedProperties adminSeedProperties;

    @Override
    public void run(ApplicationArguments args) {
        if (!adminSeedProperties.isEnabled()) {
            log.info("[SEED] Admin seeding disabled - skipping.");
            return;
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
                .email(adminSeedProperties.getEmail())
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
}
