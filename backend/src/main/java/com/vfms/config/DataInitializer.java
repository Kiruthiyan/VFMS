package com.vfms.config;

import com.vfms.auth.model.Role;
import com.vfms.auth.model.User;
import com.vfms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner commandLineRunner() {
        return args -> {
            if (repository.findByEmail("admin@fleet.com").isEmpty()) {
                var admin = User.builder()
                        .name("System Administrator")
                        .email("admin@fleet.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.ADMIN)
                        .emailVerified(true)
                        .build();
                repository.save(admin);
                System.out.println("Default Admin created: admin@fleet.com / password");
            }
        };
    }
}
