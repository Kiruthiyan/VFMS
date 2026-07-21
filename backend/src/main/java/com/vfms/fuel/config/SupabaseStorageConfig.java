package com.vfms.fuel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SupabaseStorageConfig {

    @Value("${supabase.storage.url:}")
    private String storageUrl;

    @Value("${supabase.storage.bucket:}")
    private String bucket;

    @Value("${supabase.storage.service-key:}")
    private String serviceKey;

    @Value("${supabase.storage.signed-url-ttl-seconds:300}")
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
