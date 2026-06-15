package com.vfms.dsm;

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
class DriverControllerMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getDriverUsers_unauthenticated_isDenied() throws Exception {
        // AuthorizationDeniedException is mapped to 500 by GlobalExceptionHandler on permitAll paths
        mockMvc.perform(get("/api/drivers/from-users"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void getDriverUsers_driverRole_isDenied() throws Exception {
        mockMvc.perform(get("/api/drivers/from-users"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void getDriverUsers_approver_returnsOk() throws Exception {
        mockMvc.perform(get("/api/drivers/from-users"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllInfractions_admin_returnsOk() throws Exception {
        mockMvc.perform(get("/api/drivers/infractions"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void getCompliance_approver_returnsOk() throws Exception {
        mockMvc.perform(get("/api/drivers/compliance"))
                .andExpect(status().isOk());
    }
}
