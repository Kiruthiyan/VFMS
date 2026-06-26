package com.vfms.dsm.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DriverSupabaseStorageProperties {

    @Value("${driver.supabase.storage.url:${supabase.storage.url:}}")
    private String storageUrl;

    @Value("${driver.supabase.storage.bucket:${DRIVER_SUPABASE_STORAGE_BUCKET:driver-documents}}")
    private String bucket;

    @Value("${driver.supabase.storage.service-key:${supabase.storage.service-key:}}")
    private String serviceKey;

    @Value("${driver.supabase.storage.signed-url-ttl-seconds:300}")
    private long signedUrlTtlSeconds;

    public String getStorageUrl() {
        return storageUrl;
    }

    public String getBucket() {
        return bucket;
    }

    public String getServiceKey() {
        return serviceKey;
    }

    public long getSignedUrlTtlSeconds() {
        return signedUrlTtlSeconds;
    }
}
