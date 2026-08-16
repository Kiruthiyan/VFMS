package com.vfms.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vfms.auth.dto.AuthResponse;
import com.vfms.auth.dto.LoginRequest;
import com.vfms.auth.dto.SendOtpRequest;
import com.vfms.auth.dto.VerifyOtpRequest;
import com.vfms.auth.service.AuthRateLimitService;
import com.vfms.auth.service.AuthService;
import com.vfms.auth.service.OtpService;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.HttpHeaders;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController")
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private OtpService otpService;

    @Mock
    private AuthRateLimitService authRateLimitService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        AuthController controller = new AuthController(authService, otpService, authRateLimitService);
        ReflectionTestUtils.setField(controller, "refreshTokenExpirationMs", 604800000L);
        ReflectionTestUtils.setField(controller, "refreshCookieSecure", true);
        ReflectionTestUtils.setField(controller, "refreshCookieSameSite", "None");

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
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
    @DisplayName("login sets HttpOnly refresh cookie")
    void loginSetsHttpOnlyRefreshCookie() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@example.com");
        request.setPassword("Secure@123");

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse("refresh-token"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("vfms_refresh_token=refresh-token")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("SameSite=None")))
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("refresh accepts HttpOnly cookie when request body is empty")
    void refreshAcceptsCookieWhenBodyIsEmpty() throws Exception {
        when(authService.refresh("cookie-refresh-token")).thenReturn(authResponse("rotated-refresh-token"));

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new jakarta.servlet.http.Cookie("vfms_refresh_token", "cookie-refresh-token")))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("vfms_refresh_token=rotated-refresh-token")))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"));

        verify(authService).refresh(eq("cookie-refresh-token"));
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

    private AuthResponse authResponse(String refreshToken) {
        return AuthResponse.builder()
                .accessToken("access-token")
                .refreshToken(refreshToken)
                .userId(UUID.randomUUID())
                .fullName("Admin User")
                .email("admin@example.com")
                .role(Role.ADMIN)
                .status(UserStatus.APPROVED)
                .build();
    }
}
