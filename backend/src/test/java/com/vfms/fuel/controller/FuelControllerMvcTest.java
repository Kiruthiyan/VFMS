package com.vfms.fuel.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FuelControllerMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getAllFuelRecords_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/fuel"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void getAllFuelRecords_nonAdmin_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/fuel"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllFuelRecordsReturnsOk() throws Exception {
        mockMvc.perform(get("/api/v1/fuel")).andExpect(status().isOk());
    }

    @Test
    void getFlaggedFuelRecords_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/fuel/flagged"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void getFlaggedFuelRecords_nonAdmin_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/fuel/flagged"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getFlaggedFuelRecordsReturnsOk() throws Exception {
        mockMvc.perform(get("/api/v1/fuel/flagged")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void searchFuelRecords_invalidDate_returnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/fuel/search")
                        .param("from", "bad-date")
                        .param("to", "2024-01-31"))
                .andExpect(status().isBadRequest());
    }
}
