package com.vfms.fuel.service;

import com.vfms.common.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;

@ExtendWith(MockitoExtension.class)
@DisplayName("FuelStorageService Unit Tests")
class FuelStorageServiceTest {

    @Mock
    private com.vfms.fuel.config.SupabaseStorageConfig config;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private FuelStorageService fuelStorageService;

    private MultipartFile file;

    @BeforeEach
    void setUp() {
        file = mock(MultipartFile.class);
    }

    @Test
    @DisplayName("uploadReceipt rejects files larger than 5 MB")
    void uploadReceipt_rejectsOversizedFile() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(5L * 1024 * 1024 + 1);

        ValidationException ex = assertThrows(ValidationException.class,
                () -> fuelStorageService.uploadReceipt(file));
        assertEquals("Receipt file is too large.", ex.getMessage());
    }

    @Test
    @DisplayName("uploadReceipt rejects unsupported MIME types")
    void uploadReceipt_rejectsUnsupportedMimeType() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/javascript");

        ValidationException ex = assertThrows(ValidationException.class,
                () -> fuelStorageService.uploadReceipt(file));
        assertEquals("Invalid receipt file type.", ex.getMessage());
    }

    @Test
    @DisplayName("uploadReceipt rejects valid files when Supabase is not configured")
    void uploadReceipt_rejectsWhenStorageIsNotConfigured() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");

        ValidationException ex = assertThrows(ValidationException.class,
                () -> fuelStorageService.uploadReceipt(file));

        assertEquals("Supabase storage is not configured.", ex.getMessage());
    }

    @Test
    @DisplayName("uploadReceipt stores private object path instead of public URL")
    void uploadReceipt_returnsPrivateObjectPath() throws Exception {
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("image/webp");
        when(file.getOriginalFilename()).thenReturn("receipt.webp");
        when(file.getBytes()).thenReturn(new byte[] {1, 2, 3});
        when(config.getStorageUrl()).thenReturn("https://project.supabase.co/storage/v1");
        when(config.getBucket()).thenReturn("fuel-receipts");
        when(config.getServiceKey()).thenReturn("service-key");
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{}"));

        String storedPath = fuelStorageService.uploadReceipt(file);

        assertTrue(storedPath.startsWith("receipts/"));
        assertTrue(storedPath.endsWith("_receipt.webp"));
    }

    @Test
    @DisplayName("createSignedReceiptUrl supports legacy public receipt URLs")
    void createSignedReceiptUrl_supportsLegacyPublicUrls() {
        when(config.getStorageUrl()).thenReturn("https://project.supabase.co/storage/v1");
        when(config.getBucket()).thenReturn("fuel-receipts");
        when(config.getServiceKey()).thenReturn("service-key");
        when(config.getSignedUrlTtlSeconds()).thenReturn(300L);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("signedUrl", "/object/sign/fuel-receipts/receipts/r.pdf?token=abc")));

        String signedUrl = fuelStorageService.createSignedReceiptUrl(
                "https://project.supabase.co/storage/v1/object/public/fuel-receipts/receipts/r.pdf");

        assertEquals(
                "https://project.supabase.co/storage/v1/object/sign/fuel-receipts/receipts/r.pdf?token=abc",
                signedUrl);
    }

    @Test
    @DisplayName("sanitizeFilename strips path segments and unsafe characters")
    void sanitizeFilename_stripsUnsafeCharacters() {
        assertEquals("receipt.png", fuelStorageService.sanitizeFilename("..\\evil/../receipt.png"));
        assertEquals("receipt", fuelStorageService.sanitizeFilename(".."));
    }
}
