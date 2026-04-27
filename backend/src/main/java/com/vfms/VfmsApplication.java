package com.vfms;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.AbstractEnvironment;

/**
 * Entry point for the Vehicle Fleet Management System (VFMS) Spring Boot application.
 *
 * <p>A static initialiser block runs before the Spring context is created to load
 * environment-specific secrets (database credentials, JWT secret, mail credentials,
 * etc.) from a local {@code .env} file using the Dotenv library.  Each key is
 * promoted to a JVM system property so that Spring's {@code ${...}} placeholder
 * resolution can pick them up transparently.</p>
 *
 * <p>If the {@code .env} file is absent (e.g., in CI/CD environments where variables
 * are injected directly), the loader silently skips the file rather than failing
 * the startup.</p>
 */
@SpringBootApplication
public class VfmsApplication {

    static {
        // Load environment variables from .env file
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();
        
        // Set all env variables as System properties so Spring can read them
        String[] keys = {
            "DB_URL",
            "DB_USER",
            "DB_PASSWORD",
            "JWT_SECRET",
            "MAIL_USERNAME",
            "MAIL_PASSWORD",
            "CORS_ALLOWED_ORIGINS",
            "FRONTEND_URL",
            "SUPABASE_STORAGE_URL",
            // Admin seed bootstrap — override defaults in production via these vars
            "ADMIN_SEED_ENABLED",
            "ADMIN_SEED_EMAIL",
            "ADMIN_SEED_PASSWORD",
            "ADMIN_SEED_FULL_NAME",
            "ADMIN_SEED_PHONE",
            "ADMIN_SEED_NIC"
        };
        
        for (String key : keys) {
            String value = dotenv.get(key);
            if (value != null) {
                System.setProperty(key, value);
            }
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(VfmsApplication.class, args);
    }

}
