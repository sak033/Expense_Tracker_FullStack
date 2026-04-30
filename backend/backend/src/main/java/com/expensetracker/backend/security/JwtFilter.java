package com.expensetracker.backend.security;

import com.expensetracker.backend.auth.JwtUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class JwtFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String authHeader = req.getHeader("Authorization");

        // ✅ If no token → just continue (don't crash)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            JwtUtil.extractEmail(token); // validate token
        } catch (Exception e) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // ✅ 401 instead of 500
            return;
        }

        chain.doFilter(request, response);
    }
}