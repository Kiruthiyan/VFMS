package com.vfms.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds {@code vfms.admin.seed.*} properties to control the one-time
 * default admin account that is created on first startup when no admin exists.
 */
@Data
@Component
@ConfigurationProperties(prefix = "vfms.admin.seed")
public class AdminSeedProperties {

    /** Whether the seed step runs at startup. Set to false after first deploy if desired. */
    private boolean enabled = true;

    private String email = "admin@vfms.local";
    private String password = "Admin@1234";
    private String fullName = "System Administrator";
    private String phone = "0000000000";
    private String nic = "000000000V";
}
