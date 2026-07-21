package com.vfms.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigRegressionTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void unmatchedApi_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/not-mapped-anywhere"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unmatchedApi_authenticated_returns403() throws Exception {
        mockMvc.perform(get("/api/not-mapped-anywhere"))
                .andExpect(status().isForbidden());
    }

    @Test
    void logout_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void logout_authenticated_returns200() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void trips_driverRole_returns403() throws Exception {
        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void trips_systemUserCanReadAndSubmit() throws Exception {
        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/trips/{id}/submit", java.util.UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void trips_systemUserCannotApprove() throws Exception {
        mockMvc.perform(patch("/api/trips/{id}/approve", java.util.UUID.randomUUID()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void trips_approverCanReachApprovalAction() throws Exception {
        mockMvc.perform(patch("/api/trips/{id}/approve", java.util.UUID.randomUUID()))
                .andExpect(status().isBadRequest());
    }
}
