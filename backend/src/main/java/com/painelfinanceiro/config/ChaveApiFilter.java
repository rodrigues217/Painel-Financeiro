package com.painelfinanceiro.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ChaveApiFilter extends OncePerRequestFilter {

    @Value("${app.chave-api:}")
    private String chaveEsperada;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || !request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (chaveEsperada == null || chaveEsperada.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        String chaveRecebida = request.getHeader("X-Api-Key");
        if (!chaveEsperada.equals(chaveRecebida)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"mensagem\":\"Chave de API invalida ou ausente.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
