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
 * Runs once on every startup. Creates the initial ADMIN account only when
 * no non-deleted admin already exists, preventing duplicate seeding.
 *
 * Credentials are read from {@code vfms.admin.seed.*} properties so that
 * no values are hardcoded — override via environment variables:
 *   ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, etc.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSeedProperties adminSeedProperties;

    @Override
    public void run(ApplicationArguments args) {
        if (!adminSeedProperties.isEnabled()) {
            log.info("[SEED] Admin seeding disabled — skipping.");
            return;
        }
        seedAdminUser();
    }

    private void seedAdminUser() {
        // Guard: skip if any non-deleted ADMIN already exists
        if (userRepository.existsByRoleAndDeletedAtIsNull(Role.ADMIN)) {
            log.info("[SEED] Admin user already exists — skipping seed.");
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
                // Require password change on first login for security
                .passwordChangeRequired(true)
                .createdBy("system")
                .build();

        userRepository.save(admin);

        log.info("[SEED] Default admin created — email: {}, password change required on first login.",
                admin.getEmail());
    }
}
