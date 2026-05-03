package com.vfms.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vfms.auth.dto.SendOtpRequest;
import com.vfms.auth.dto.VerifyOtpRequest;
import com.vfms.auth.service.AuthService;
import com.vfms.auth.service.OtpService;
import com.vfms.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController")
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private OtpService otpService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(authService, otpService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("rejects blank OTP email before the legacy service is called")
    void rejectsBlankOtpEmailBeforeTheLegacyServiceIsCalled() throws Exception {
        SendOtpRequest request = new SendOtpRequest();
        request.setEmail(" ");

        mockMvc.perform(post("/api/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.email").value("Email is required."));

        verifyNoInteractions(otpService);
    }

    @Test
    @DisplayName("normalizes email before sending the OTP")
    void normalizesEmailBeforeSendingTheOtp() throws Exception {
        SendOtpRequest request = new SendOtpRequest();
        request.setEmail(" STAFF@Example.com ");

        mockMvc.perform(post("/api/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(otpService).sendOtp("staff@example.com");
    }

    @Test
    @DisplayName("rejects a blank OTP code before verification")
    void rejectsABlankOtpCodeBeforeVerification() throws Exception {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("staff@example.com");
        request.setOtp(" ");

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.otp")
                        .value("Please enter the verification code sent to your email."));

        verifyNoInteractions(otpService);
    }
}
