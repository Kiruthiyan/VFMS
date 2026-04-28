package com.vfms.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds {@code vfms.admin.seed.*} properties for the optional first-run
 * administrator bootstrap flow. Default fallback values are defined in
 * {@code application.properties} so they stay centralized in one place.
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
