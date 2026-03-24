package com.vfms;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.AbstractEnvironment;

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
            "SUPABASE_STORAGE_URL"
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
