package com.vfms.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class FleetDocumentSecurityValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void maintenanceQuotationUpload_unauthenticated_returns401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "quote.pdf",
                "application/pdf",
                "pdf-content".getBytes());

        mockMvc.perform(multipart("/api/maintenance/{id}/quotation", 1L).file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void maintenanceQuotationUpload_approver_forbidden() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "quote.pdf",
                "application/pdf",
                "pdf-content".getBytes());

        mockMvc.perform(multipart("/api/maintenance/{id}/quotation", 1L).file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void maintenanceQuotationUpload_rejectsNonPdfMime() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "quote.txt",
                "text/plain",
                "not-a-pdf".getBytes());

        mockMvc.perform(multipart("/api/maintenance/{id}/quotation", 1L).file(file))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void maintenanceInvoiceUpload_rejectsUnsafeFilename() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "../invoice.pdf",
                "application/pdf",
                "pdf-content".getBytes());

        mockMvc.perform(multipart("/api/maintenance/{id}/invoice", 1L).file(file))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void maintenanceInvoiceUpload_rejectsOversizedFile() throws Exception {
        byte[] oversized = new byte[(5 * 1024 * 1024) + 1];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invoice.pdf",
                "application/pdf",
                oversized);

        mockMvc.perform(multipart("/api/maintenance/{id}/invoice", 1L).file(file))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void maintenanceFileAccess_invalidReference_returns400() throws Exception {
        mockMvc.perform(get("/api/maintenance/files/access").param("ref", "invalid-ref"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void maintenanceFileAccess_driver_forbidden() throws Exception {
        mockMvc.perform(get("/api/maintenance/files/access").param("ref", "supabase://fleet-documents/maintenance/1/quotation/doc.pdf"))
                .andExpect(status().isForbidden());
    }

    @Test
    void rentalAgreementUpload_unauthenticated_returns401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "agreement.pdf",
                "application/pdf",
                "pdf-content".getBytes());

        mockMvc.perform(multipart("/api/rentals/{id}/agreement", 1L).file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void rentalAgreementUpload_approver_forbidden() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "agreement.pdf",
                "application/pdf",
                "pdf-content".getBytes());

        mockMvc.perform(multipart("/api/rentals/{id}/agreement", 1L).file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void rentalAgreementUpload_rejectsNonPdfMime() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "agreement.png",
                "image/png",
                "fake-image".getBytes());

        mockMvc.perform(multipart("/api/rentals/{id}/agreement", 1L).file(file))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void rentalInvoiceUpload_rejectsInvalidExtension() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invoice.png",
                "application/pdf",
                "pdf-content".getBytes());

        mockMvc.perform(multipart("/api/rentals/{id}/invoice", 1L).file(file))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void rentalFileAccess_invalidReference_returns400() throws Exception {
        mockMvc.perform(get("/api/rentals/files/access").param("ref", "invalid-ref"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void rentalFileAccess_driver_forbidden() throws Exception {
        mockMvc.perform(get("/api/rentals/files/access").param("ref", "supabase://fleet-documents/rentals/1/agreement/doc.pdf"))
                .andExpect(status().isForbidden());
    }
}
