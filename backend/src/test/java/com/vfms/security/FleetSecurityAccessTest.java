package com.vfms.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class FleetSecurityAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void vehicles_get_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void vehicles_get_systemUser_allowed() throws Exception {
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void vehicles_post_systemUser_forbidden() throws Exception {
        mockMvc.perform(post("/api/vehicles"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void vehicles_post_admin_reachesControllerValidation() throws Exception {
        mockMvc.perform(post("/api/vehicles"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void vehicles_patch_admin_reachesController() throws Exception {
        mockMvc.perform(patch("/api/vehicles/{id}/status", 99999L))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void vehicles_patch_approver_forbidden() throws Exception {
        mockMvc.perform(patch("/api/vehicles/{id}/retire", 1L))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void maintenance_post_systemUser_reachesControllerValidation() throws Exception {
        mockMvc.perform(post("/api/maintenance"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void maintenance_post_approver_forbidden() throws Exception {
        mockMvc.perform(post("/api/maintenance"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void maintenance_approve_approver_reachesService() throws Exception {
        mockMvc.perform(patch("/api/maintenance/{id}/approve", 99999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void maintenance_approve_systemUser_forbidden() throws Exception {
        mockMvc.perform(patch("/api/maintenance/{id}/approve", 1L))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void maintenance_submit_systemUser_reachesService() throws Exception {
        mockMvc.perform(patch("/api/maintenance/{id}/submit", 99999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void maintenance_submit_approver_forbidden() throws Exception {
        mockMvc.perform(patch("/api/maintenance/{id}/submit", 1L))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void rentals_post_systemUser_reachesControllerValidation() throws Exception {
        mockMvc.perform(post("/api/rentals"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void rentals_post_approver_forbidden() throws Exception {
        mockMvc.perform(post("/api/rentals"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void rentals_patch_systemUser_reachesService() throws Exception {
        mockMvc.perform(patch("/api/rentals/{id}/close", 99999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void rentals_patch_approver_forbidden() throws Exception {
        mockMvc.perform(patch("/api/rentals/{id}/close", 1L))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void vendors_get_systemUser_allowed() throws Exception {
        mockMvc.perform(get("/api/vendors"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void vendors_get_approver_forbidden() throws Exception {
        mockMvc.perform(get("/api/vendors"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void vendors_getById_systemUser_forbidden() throws Exception {
        mockMvc.perform(get("/api/vendors/{id}", 1L))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void vendors_getById_admin_reachesService() throws Exception {
        mockMvc.perform(get("/api/vendors/{id}", 99999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void vendors_all_systemUser_forbidden() throws Exception {
        mockMvc.perform(get("/api/vendors/all"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void vendors_toggle_admin_reachesService() throws Exception {
        mockMvc.perform(patch("/api/vendors/{id}/toggle-status", 99999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void vendors_toggle_systemUser_forbidden() throws Exception {
        mockMvc.perform(patch("/api/vendors/{id}/toggle-status", 1L))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void rentals_put_admin_reachesControllerValidation() throws Exception {
        mockMvc.perform(put("/api/rentals/{id}", 1L))
                .andExpect(status().isBadRequest());
    }
}
