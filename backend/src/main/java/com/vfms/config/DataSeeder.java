package com.vfms.config;

import com.vfms.admin.config.AdminSeedProperties;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.employee.entity.EmployeeRegistryRecord;
import com.vfms.employee.repository.EmployeeRegistryRepository;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
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
    private final com.vfms.vehicle.VehicleRepository vehicleRepository;

    @Override
    public void run(ApplicationArguments args) {
        logEmployeeRegistryState();
        seedTeamUsers();
        seedDriverAndVehicle();

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

    private void seedDriverAndVehicle() {
        // Seed vehicle entity
        if (!vehicleRepository.existsByPlateNumber("WP-CAB-1234")) {
            com.vfms.vehicle.Vehicle v = com.vfms.vehicle.Vehicle.builder()
                    .plateNumber("WP-CAB-1234")
                    .brand("Toyota")
                    .model("Prius")
                    .year(2018)
                    .vehicleType(com.vfms.vehicle.VehicleType.CAR)
                    .fuelType(com.vfms.vehicle.FuelType.PETROL)
                    .status(com.vfms.vehicle.VehicleStatus.AVAILABLE)
                    .seatingCapacity(5)
                    .active(true)
                    .build();
            vehicleRepository.save(v);
            log.info("[SEED] Seeded Toyota Prius WP-CAB-1234");
        }
    }

    private void seedTeamUsers() {
        seedSingleTeamUser("Kiruthiyan Admin", "kiruthiyan8@gmail.com", "Admin@1234", "0771234568", "990088888V", Role.ADMIN, "EMP008");
        seedSingleTeamUser("Kiruthiyan Approver", "kiruthiyan7@gmail.com", "Kiru@1234", "0771234567", "990077777V", Role.APPROVER, "EMP007");
        seedSingleTeamUser("Kavishanth Driver", "kavishanthn16@gmail.com", "Kavi@1234", "0771234516", "990161616V", Role.DRIVER, "EMP016");
        seedSingleTeamUser("Abhisakthika Requestor", "abhisakthika@gmail.com", "Abhi@1234", "0771234510", "990101010V", Role.SYSTEM_USER, "EMP010");
    }

    private void seedSingleTeamUser(String fullName, String email, String password, String phone, String nic, Role role, String employeeId) {
        String normalizedEmail = email.trim().toLowerCase();
        
        // 1. Ensure EmployeeRegistryRecord exists
        if (employeeRegistryRepository.findByEmailIgnoreCase(normalizedEmail).isEmpty()) {
            EmployeeRegistryRecord record = EmployeeRegistryRecord.builder()
                    .employeeId(employeeId)
                    .email(normalizedEmail)
                    .nic(nic)
                    .phone(phone)
                    .fullName(fullName)
                    .department(role == Role.DRIVER ? "Transport" : "Management")
                    .designation(role.name())
                    .officeLocation("Headquarters")
                    .active(true)
                    .build();
            employeeRegistryRepository.save(record);
            log.info("[SEED] Created employee registry record for {}", normalizedEmail);
        }

        // 2. Ensure User exists and is fully enabled/approved
        if (!userRepository.existsByEmail(normalizedEmail)) {
            User.UserBuilder userBuilder = User.builder()
                    .fullName(fullName)
                    .email(normalizedEmail)
                    .password(passwordEncoder.encode(password))
                    .phone(phone)
                    .nic(nic)
                    .role(role)
                    .status(UserStatus.APPROVED)
                    .emailVerified(true)
                    .createdByAdmin(true)
                    .enabled(true)
                    .passwordChangeRequired(false)
                    .createdBy(SYSTEM_ACTOR)
                    .employeeId(employeeId)
                    .department(role == Role.DRIVER ? "Transport" : "Management")
                    .designation(role.name())
                    .officeLocation("Headquarters");

            if (role == Role.DRIVER) {
                userBuilder.licenseNumber("L" + nic.substring(0, Math.min(nic.length(), 7)))
                        .licenseExpiryDate(LocalDate.now().plusYears(5))
                        .experienceYears(5)
                        .certifications("Heavy Vehicle License");
            }

            User user = userBuilder.build();
            userRepository.save(user);
            log.info("[SEED] Seeded team user: {} with role: {}", normalizedEmail, role);
        } else {
            // Update password and status if user already exists but might have wrong credentials or deactivated status
            User user = userRepository.findByEmail(normalizedEmail).get();
            user.setPassword(passwordEncoder.encode(password));
            user.setStatus(UserStatus.APPROVED);
            user.setEnabled(true);
            user.setEmailVerified(true);
            userRepository.save(user);
            log.info("[SEED] Updated password and activated existing team user: {}", normalizedEmail);
        }
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
