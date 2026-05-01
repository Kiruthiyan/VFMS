package com.vfms.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds {@code vfms.admin.seed.*} properties for the optional first-run
 * administrator bootstrap flow. The seed is intentionally environment-driven
 * so committed source code does not carry default administrator credentials.
 */
@Data
@Component
@ConfigurationProperties(prefix = "vfms.admin.seed")
public class AdminSeedProperties {

    private boolean enabled;
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String nic;
}
