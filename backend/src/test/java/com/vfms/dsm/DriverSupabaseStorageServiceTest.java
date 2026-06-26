package com.vfms.dsm;

import com.vfms.common.exception.ValidationException;
import com.vfms.dsm.config.DriverSupabaseStorageProperties;
import com.vfms.dsm.entity.DriverAggregate.DriverDocument;
import com.vfms.dsm.service.DriverSupabaseStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DriverSupabaseStorageServiceTest {

    @Mock RestTemplate restTemplate;

    private DriverSupabaseStorageService service;
    private UUID driverId;

    @BeforeEach
    void setUp() {
        DriverSupabaseStorageProperties properties = new DriverSupabaseStorageProperties();
        ReflectionTestUtils.setField(properties, "storageUrl", "https://project.supabase.co/storage/v1");
        ReflectionTestUtils.setField(properties, "bucket", "driver-documents");
        ReflectionTestUtils.setField(properties, "serviceKey", "service-secret");
        ReflectionTestUtils.setField(properties, "signedUrlTtlSeconds", 300L);
        service = new DriverSupabaseStorageService(properties, restTemplate);
        driverId = UUID.randomUUID();
    }

    @Test
    void uploadsDriverFileToSafeObjectPath() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{}"));

        MockMultipartFile file = new MockMultipartFile("file", "license.pdf", "application/pdf", "pdf".getBytes());

        DriverSupabaseStorageService.StoredObject stored =
                service.uploadDriverFile(driverId, DriverDocument.DocumentEntityType.LICENSE, file);

        assertThat(stored.bucketName()).isEqualTo("driver-documents");
        assertThat(stored.storagePath())
                .startsWith("drivers/" + driverId + "/documents/license/")
                .endsWith(".pdf");
        verify(restTemplate).exchange(
                startsWith("https://project.supabase.co/storage/v1/object/driver-documents/drivers/" + driverId + "/documents/license/"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        );
    }

    @Test
    void createsShortLivedSignedUrl() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("signedURL", "/object/sign/driver-documents/drivers/a/file.pdf?token=abc")));

        String signedUrl = service.createSignedUrl("driver-documents", "drivers/a/file.pdf");

        assertThat(signedUrl).isEqualTo("https://project.supabase.co/storage/v1/object/sign/driver-documents/drivers/a/file.pdf?token=abc");

        @SuppressWarnings("rawtypes")
        ArgumentCaptor<HttpEntity> entity = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(anyString(), eq(HttpMethod.POST), entity.capture(), eq(Map.class));
        assertThat(entity.getValue().getBody()).isEqualTo(Map.of("expiresIn", 300L));
    }

    @Test
    void rejectsUnsafeOriginalFilename() {
        MockMultipartFile file = new MockMultipartFile("file", "../license.pdf", "application/pdf", "pdf".getBytes());

        assertThatThrownBy(() -> service.uploadDriverFile(driverId, DriverDocument.DocumentEntityType.LICENSE, file))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Unsafe document file name");
    }

    @Test
    void rejectsMismatchedExtensionAndMimeType() {
        MockMultipartFile file = new MockMultipartFile("file", "license.exe", "application/pdf", "pdf".getBytes());

        assertThatThrownBy(() -> service.uploadDriverFile(driverId, DriverDocument.DocumentEntityType.LICENSE, file))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Invalid document file extension");
    }
}
