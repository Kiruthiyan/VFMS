package com.vfms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ReportSupabaseStorageProperties {

    @Value("${report.supabase.storage.url:${supabase.storage.url:}}")
    private String storageUrl;

    @Value("${report.supabase.storage.bucket:${REPORT_SUPABASE_STORAGE_BUCKET:report-documents}}")
    private String bucket;

    @Value("${report.supabase.storage.service-key:${supabase.storage.service-key:}}")
    private String serviceKey;

    @Value("${report.supabase.storage.signed-url-ttl-seconds:300}")
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
