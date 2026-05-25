package com.leavemanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class JwtTokenFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Get the authorization header
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        String requestPath = request.getRequestURI();

        // Check if token is present
        if (authHeader == null || authHeader.isEmpty()) {
            // Respond with missing token error
            sendErrorResponse(response, "Token is missing", HttpStatus.UNAUTHORIZED, requestPath);
            return;
        }

        // Check if token has Bearer prefix
        if (!authHeader.startsWith(BEARER_PREFIX)) {
            sendErrorResponse(response, "Invalid token format. Expected 'Bearer <token>'", HttpStatus.UNAUTHORIZED, requestPath);
            return;
        }

        // Token is present and properly formatted, continue the filter chain
        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, String message, HttpStatus status, String path)
            throws IOException {
        
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(status.value());

        String jsonResponse = String.format(
                "{\"status\":%d,\"message\":\"%s\",\"error\":\"Unauthorized\",\"timestamp\":\"%s\",\"path\":\"%s\"}",
                status.value(),
                message,
                LocalDateTime.now(),
                path
        );

        response.getWriter().write(jsonResponse);
    }
}

