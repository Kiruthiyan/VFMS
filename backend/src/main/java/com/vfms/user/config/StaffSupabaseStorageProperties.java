package com.vfms.user.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StaffSupabaseStorageProperties {

    @Value("${staff.supabase.storage.url:${supabase.storage.url:}}")
    private String storageUrl;

    @Value("${staff.supabase.storage.bucket:driver-documents}")
    private String bucket;

    @Value("${staff.supabase.storage.service-key:${supabase.storage.service-key:}}")
    private String serviceKey;

    @Value("${staff.supabase.storage.signed-url-ttl-seconds:300}")
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
