package com.vfms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 * Validates JWT tokens from request headers and sets authentication context
 * Logs all JWT parsing failures and successful authentications for debugging
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String requestPath = request.getServletPath();

        // No Authorization header - skip JWT validation
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No JWT token found in request: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String userEmail;

        try {
            // Extract username from JWT token
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Log JWT parsing failures for debugging
            // SECURITY: Don't log the actual token, only the error type and endpoint
            log.warn("JWT parsing failed for request {}: {}", requestPath, e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        // Set authentication if token is valid and no existing authentication
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Token is valid - create authentication token
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.debug("JWT authentication successful for user: {} on path: {}", 
                        userEmail, requestPath);
                } else {
                    // Token validation failed
                    log.warn("JWT token validation failed for user: {} on path: {}", 
                        userEmail, requestPath);
                }
            } catch (Exception e) {
                // User not found or other error
                log.warn("Failed to load user details for email: {}: {}", 
                    userEmail, e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}