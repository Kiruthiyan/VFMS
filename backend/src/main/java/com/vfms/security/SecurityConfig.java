package com.vfms.security;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * HTTP security for VFMS.
 *
 * Public routes are limited to authentication bootstrap flows. Every API route
 * after those matchers must be authenticated and role-mapped here or by method
 * security. Unknown API routes are denied by default.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig::disable))
                .authorizeHttpRequests(auth -> auth
                        // --- Authentication (public) ---
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/refresh",
                                "/api/auth/staff/**",
                                "/api/auth/verify-email",
                                "/api/auth/resend-verification",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/send-otp",
                                "/api/auth/verify-otp"
                        ).permitAll()
                        // --- Uploaded driver/profile files served as static resources ---
                        .requestMatchers("/uploads/**").permitAll()
                        // --- User management (admin only) ---
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // --- Reports (admin only) ---
                        .requestMatchers("/api/reports/**").hasRole("ADMIN")
                        // --- Fuel management (admin only; matches FuelController) ---
                        .requestMatchers("/api/v1/fuel/**").hasRole("ADMIN")
                        // --- Authenticated logout ---
                        .requestMatchers("/api/auth/logout").authenticated()
                        // --- Authenticated user profile & password change ---
                        .requestMatchers("/api/user/**").authenticated()
                        // --- Staff self-profile (authenticated; method security enforces role) ---
                        .requestMatchers("/api/staff-profile/**").authenticated()
                        // --- Driver self-service portal (ROLE_DRIVER only, IDOR-safe) ---
                        .requestMatchers("/api/driver/**").hasRole("DRIVER")
                        // --- Driver/staff management (approver/admin only) ---
                        .requestMatchers("/api/drivers/**", "/api/internal/drivers/**")
                        .hasAnyRole("ADMIN", "APPROVER")
                        // --- Trips: operational requests and approver actions ---
                        .requestMatchers(HttpMethod.GET, "/api/trips/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER", "APPROVER")
                        .requestMatchers(HttpMethod.POST, "/api/trips/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(HttpMethod.PUT, "/api/trips/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/trips/*/approve",
                                "/api/trips/*/reject",
                                "/api/trips/*/assign-driver",
                                "/api/trips/*/assign-vehicle",
                                "/api/trips/*/cancel"
                        ).hasAnyRole("ADMIN", "APPROVER")
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/trips/*/submit",
                                "/api/trips/*/feedback"
                        ).hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(HttpMethod.PATCH, "/api/trips/**").denyAll()
                        // --- Fleet module: vehicles ---
                        .requestMatchers(HttpMethod.GET, "/api/vehicles/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER", "APPROVER")
                        .requestMatchers(HttpMethod.POST, "/api/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vehicles/**").hasRole("ADMIN")
                        // --- Fleet module: maintenance ---
                        .requestMatchers(HttpMethod.GET, "/api/maintenance/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER", "APPROVER")
                        .requestMatchers(HttpMethod.POST, "/api/maintenance/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(HttpMethod.PUT, "/api/maintenance/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenance/*/approve", "/api/maintenance/*/reject")
                        .hasAnyRole("ADMIN", "APPROVER")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenance/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/maintenance/**").hasRole("ADMIN")
                        // --- Fleet module: rentals ---
                        .requestMatchers(HttpMethod.GET, "/api/rentals/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER", "APPROVER")
                        .requestMatchers(HttpMethod.POST, "/api/rentals/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(HttpMethod.PUT, "/api/rentals/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(HttpMethod.PATCH, "/api/rentals/**")
                        .hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/rentals/**").hasRole("ADMIN")
                        // --- Fleet module: vendors ---
                        .requestMatchers(HttpMethod.GET, "/api/vendors/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/vendors")
                        .hasAnyRole("ADMIN", "SYSTEM_USER")
                        .requestMatchers(HttpMethod.GET, "/api/vendors/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/vendors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/vendors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/vendors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vendors/**").hasRole("ADMIN")
                        // --- API deny-by-default: new APIs must be explicitly role-mapped ---
                        .requestMatchers("/api/**").denyAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Set allowed origins from configuration
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList());

        // Allow all HTTP methods needed for REST API
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Explicitly list allowed headers (SECURITY: Never use "*" with allowCredentials=true)
        config.setAllowedHeaders(List.of(
            "Authorization",      // JWT token
            "Content-Type",       // JSON content type
            "Accept",             // Response format
            "X-Requested-With",   // AJAX request identifier
            "X-User-Id"           // Legacy DSM user audit header
        ));

        // Allow credentials (cookies, authorization headers)
        // SECURITY: This only works with explicit headers (not "*")
        config.setAllowCredentials(true);

        // Expose headers that browser can access from JS
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
