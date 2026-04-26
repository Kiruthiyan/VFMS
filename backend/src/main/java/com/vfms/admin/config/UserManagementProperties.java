package com.vfms.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "vfms.user")
public class UserManagementProperties {
    private TempPassword tempPassword = new TempPassword();

    @Data
    public static class TempPassword {
        private int length = 10;
        private String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    }
}

