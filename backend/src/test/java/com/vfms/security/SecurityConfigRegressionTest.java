package com.vfms.security;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
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
    void trips_driverCanReadOwnDriverTripListsAndDetailRoute() throws Exception {
        UUID driverId = UUID.randomUUID();

        mockMvc.perform(get("/api/trips/driver/{driverId}", driverId)
                        .with(driverPrincipal(driverId)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/trips/driver/{driverId}/upcoming", driverId)
                        .with(driverPrincipal(driverId)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/trips/{id}", UUID.randomUUID())
                        .with(driverPrincipal(driverId)))
                .andExpect(status().isNotFound());
    }

    @Test
    void trips_driverCannotReadAnotherDriversTripList() throws Exception {
        mockMvc.perform(get("/api/trips/driver/{driverId}", UUID.randomUUID())
                        .with(driverPrincipal(UUID.randomUUID())))
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
    @WithMockUser(roles = "SYSTEM_USER")
    void trips_systemUserCannotUseDriverExecutionAction() throws Exception {
        mockMvc.perform(patch("/api/trips/{id}/driver-accept", java.util.UUID.randomUUID()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void trips_driverCanReachDriverExecutionActions() throws Exception {
        UUID driverId = UUID.randomUUID();
        UUID id = UUID.randomUUID();

        mockMvc.perform(patch("/api/trips/{id}/driver-accept", id)
                        .with(driverPrincipal(driverId)))
                .andExpect(status().isNotFound());
        mockMvc.perform(patch("/api/trips/{id}/driver-reject", id)
                        .contentType("application/json")
                        .content("{\"notes\":\"Driver unavailable for this assignment\"}")
                        .with(driverPrincipal(driverId)))
                .andExpect(status().isNotFound());
        mockMvc.perform(patch("/api/trips/{id}/start", id)
                        .with(driverPrincipal(driverId)))
                .andExpect(status().isNotFound());
        mockMvc.perform(patch("/api/trips/{id}/complete", id)
                        .with(driverPrincipal(driverId)))
                .andExpect(status().isNotFound());
        mockMvc.perform(patch("/api/trips/{id}/log-stop", id)
                        .with(driverPrincipal(driverId)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "APPROVER")
    void trips_approverCanReachApprovalAction() throws Exception {
        mockMvc.perform(patch("/api/trips/{id}/approve", java.util.UUID.randomUUID()))
                .andExpect(status().isBadRequest());
    }

    private static RequestPostProcessor driverPrincipal(UUID driverId) {
        User driver = User.builder()
                .id(driverId)
                .fullName("Driver User")
                .email("driver@example.com")
                .password("password")
                .phone("0770000000")
                .nic("123456789V")
                .role(Role.DRIVER)
                .status(UserStatus.APPROVED)
                .enabled(true)
                .build();
        return authentication(new UsernamePasswordAuthenticationToken(driver, "password", driver.getAuthorities()));
    }
}
