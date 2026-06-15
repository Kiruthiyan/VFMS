package com.vfms.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vfms.admin.dto.CreateUserRequest;
import com.vfms.admin.dto.SoftDeleteRequest;
import com.vfms.common.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminUserControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getAllUsers_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void getAllUsers_nonAdmin_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_admin_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk());
    }

    @Test
    void createUser_unauthenticated_returns401() throws Exception {
        CreateUserRequest request = new CreateUserRequest();
        request.setFullName("Test User");
        request.setEmail("test@vfms.com");
        request.setPhone("0771234567");
        request.setNic("200012345678");
        request.setRole(Role.DRIVER);
        request.setLicenseNumber("DL123456");
        request.setLicenseExpiryDate("2030-05-01");

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "SYSTEM_USER")
    void createUser_nonAdmin_returns403() throws Exception {
        CreateUserRequest request = new CreateUserRequest();
        request.setFullName("Test User");
        request.setEmail("test@vfms.com");
        request.setPhone("0771234567");
        request.setNic("200012345678");
        request.setRole(Role.DRIVER);
        request.setLicenseNumber("DL123456");
        request.setLicenseExpiryDate("2030-05-01");

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void toggleUserStatus_unauthenticated_returns401() throws Exception {
        mockMvc.perform(patch("/api/admin/users/{id}/toggle-status", UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void toggleUserStatus_nonAdmin_returns403() throws Exception {
        mockMvc.perform(patch("/api/admin/users/{id}/toggle-status", UUID.randomUUID()))
                .andExpect(status().isForbidden());
    }

    @Test
    void softDeleteUser_unauthenticated_returns401() throws Exception {
        SoftDeleteRequest request = new SoftDeleteRequest();
        request.setReason("No longer needed");

        mockMvc.perform(delete("/api/admin/users/{id}", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void softDeleteUser_nonAdmin_returns403() throws Exception {
        SoftDeleteRequest request = new SoftDeleteRequest();
        request.setReason("No longer needed");

        mockMvc.perform(delete("/api/admin/users/{id}", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
