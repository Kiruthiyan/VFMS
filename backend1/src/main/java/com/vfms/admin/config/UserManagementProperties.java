package com.vfms.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds configurable user-management properties.
 *
 * Temporary password defaults are kept in {@code application.properties} so
 * there is a single source of truth for fallback values.
 */
@Data
@Component
@ConfigurationProperties(prefix = "vfms.user")
public class UserManagementProperties {

    private TempPassword tempPassword = new TempPassword();

    @Data
    public static class TempPassword {
        private int length;
        private String chars;
    }
}
