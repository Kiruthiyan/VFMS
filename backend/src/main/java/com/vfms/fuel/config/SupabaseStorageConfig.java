package com.vfms.fuel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SupabaseStorageConfig {

<<<<<<< HEAD
    @Value("${supabase.storage.url}")
    private String storageUrl;

    @Value("${supabase.storage.bucket}")
    private String bucket;

    @Value("${supabase.storage.service-key}")
=======
    @Value("${supabase.storage.url:}")
    private String storageUrl;

    @Value("${supabase.storage.bucket:}")
    private String bucket;

    @Value("${supabase.storage.service-key:}")
>>>>>>> origin/feature/user-management
    private String serviceKey;

    public String getStorageUrl() { return storageUrl; }
    public String getBucket() { return bucket; }
    public String getServiceKey() { return serviceKey; }
}
