package com.vfms.fleet.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FleetSupabaseStorageProperties {

    @Value("${fleet.supabase.storage.url:${supabase.storage.url:}}")
    private String storageUrl;

    @Value("${fleet.supabase.storage.bucket:${FLEET_SUPABASE_STORAGE_BUCKET:fleet-documents}}")
    private String bucket;

    @Value("${fleet.supabase.storage.service-key:${supabase.storage.service-key:}}")
    private String serviceKey;

    @Value("${fleet.supabase.storage.signed-url-ttl-seconds:300}")
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
