package com.vfms.fuel.service;

import com.vfms.common.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
    @DisplayName("sanitizeFilename strips path segments and unsafe characters")
    void sanitizeFilename_stripsUnsafeCharacters() {
        assertEquals("receipt.png", fuelStorageService.sanitizeFilename("..\\evil/../receipt.png"));
        assertEquals("receipt", fuelStorageService.sanitizeFilename(".."));
    }
}
