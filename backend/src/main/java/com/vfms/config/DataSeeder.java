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
        seedEmployeeRegistry();

        if (!adminSeedProperties.isEnabled()) {
            log.info("[SEED] Admin seeding disabled - skipping.");
            return;
        }

        if (!hasCompleteAdminSeedConfiguration()) {
            log.warn("[SEED] Admin seeding enabled but configuration is incomplete - skipping.");
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

    private void seedEmployeeRegistry() {
        if (employeeRegistryRepository.count() > 0) {
            log.info("[SEED] Employee registry already contains records - skipping seed.");
            return;
        }

        List<EmployeeRegistryRecord> staffRecords = List.of(
                buildStaffRecord(
                        "EMP001",
                        "aivura7@gmail.com",
                        "200312345678",
                        "0771234567",
                        "Perujan",
                        "Logistics",
                        "Operations Coordinator",
                        "Colombo Head Office"
                ),
                buildStaffRecord(
                        "EMP002",
                        "nimal.fernando@vfms.local",
                        "199812345679",
                        "0762345678",
                        "Nimal Fernando",
                        "Transport",
                        "Fleet Supervisor",
                        "Gampaha Regional Office"
                ),
                buildStaffRecord(
                        "EMP003",
                        "chamara.jayasinghe@vfms.local",
                        "200012309876",
                        "0701234567",
                        "Chamara Jayasinghe",
                        "Logistics",
                        "Dispatch Officer",
                        "Kurunegala Operations Center"
                ),
                buildStaffRecord(
                        "EMP004",
                        "ruwan.wijesinghe@vfms.local",
                        "199912340987",
                        "0765678901",
                        "Ruwan Wijesinghe",
                        "Transport",
                        "Route Planning Executive",
                        "Negombo Branch"
                ),
                buildStaffRecord(
                        "EMP005",
                        "amila.kumara@vfms.local",
                        "200102349876",
                        "0756789012",
                        "Amila Kumara",
                        "Operations",
                        "Fleet Operations Assistant",
                        "Matara Field Office"
                ),
                buildStaffRecord(
                        "EMP006",
                        "dilan.rathnayake@vfms.local",
                        "199812349876",
                        "0717890123",
                        "Dilan Rathnayake",
                        "Transport",
                        "Transport Officer",
                        "Anuradhapura Service Hub"
                ),
                buildStaffRecord(
                        "EMP007",
                        "pradeep.bandara@vfms.local",
                        "199702348765",
                        "0728901234",
                        "Pradeep Bandara",
                        "Logistics",
                        "Asset Movement Coordinator",
                        "Badulla Regional Office"
                ),
                buildStaffRecord(
                        "EMP008",
                        "sanduni.de.silva@vfms.local",
                        "199904567890",
                        "0743456789",
                        "Sanduni De Silva",
                        "Finance",
                        "Transport Billing Analyst",
                        "Colombo Head Office"
                ),
                buildStaffRecord(
                        "EMP009",
                        "tharindu.gunasekara@vfms.local",
                        "199605432187",
                        "0784567890",
                        "Tharindu Gunasekara",
                        "IT",
                        "Systems Support Executive",
                        "Kandy Technology Office"
                ),
                buildStaffRecord(
                        "EMP010",
                        "ishara.karunaratne@vfms.local",
                        "199856789012",
                        "0775678901",
                        "Ishara Karunaratne",
                        "Human Resources",
                        "Staff Services Executive",
                        "Colombo Head Office"
                )
        );

        employeeRegistryRepository.saveAll(staffRecords);
        log.info("[SEED] Inserted {} employee registry records.", staffRecords.size());
    }

    private EmployeeRegistryRecord buildStaffRecord(
            String employeeId,
            String email,
            String nic,
            String phone,
            String fullName,
            String department,
            String designation,
            String officeLocation
    ) {
        return EmployeeRegistryRecord.builder()
                .employeeId(employeeId)
                .email(email)
                .nic(nic)
                .phone(phone)
                .fullName(fullName)
                .department(department)
                .designation(designation)
                .officeLocation(officeLocation)
                .active(true)
                .build();
    }

    private boolean isConfigured(String value) {
        return value != null && !value.isBlank();
    }
}
