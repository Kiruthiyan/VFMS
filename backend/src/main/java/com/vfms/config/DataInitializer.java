package com.vfms.config;

import com.vfms.auth.model.Role;
import com.vfms.auth.model.User;
import com.vfms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Order(1)
    public CommandLineRunner commandLineRunner() {
        return args -> {
            // Create test admin user
            if (repository.findByEmail("admin@fleet.com").isEmpty()) {
                var admin = User.builder()
                        .firstName("Admin")
                        .lastName("User")
                        .email("admin@fleet.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.ADMIN)
                        .emailVerified(true)
                        .status(true)
                        .joinedDate(java.time.LocalDate.now())
                        .build();
                repository.save(admin);
                log.info("✅ Default Admin created: admin@fleet.com / password");
            }
            
            // Create test driver user
            if (repository.findByEmail("driver@example.com").isEmpty()) {
                var driver = User.builder()
                        .firstName("Driver")
                        .lastName("User")
                        .email("driver@example.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.DRIVER)
                        .emailVerified(true)
                        .licenseNumber("DL-2024-12345")
                        .status(true)
                        .joinedDate(java.time.LocalDate.now())
                        .build();
                repository.save(driver);
                log.info("✅ Test Driver created: driver@example.com / password");
            }
            
            log.info("\n✅ ==========================================");
            log.info("✅ Test Data Initialized Successfully!");
            log.info("✅ System Ready for Testing!");
            log.info("✅ ==========================================\n");
        };
    }
}

