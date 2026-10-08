package com.shareride;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.*;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.*;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
class JwtService {
  private final SecretKey key;
  private final long ttl;

  JwtService(@Value("${app.jwt.secret}") String s, @Value("${app.jwt.ttl-hours}") long h) {
    key = Keys.hmacShaKeyFor(s.getBytes(StandardCharsets.UTF_8));
    ttl = h * 3600_000;
  }

  String create(Long id) {
    return Jwts.builder().subject(String.valueOf(id)).issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + ttl)).signWith(key).compact();
  }

  Long parse(String t) {
    return Long.valueOf(Jwts.parser().verifyWith(key).build().parseSignedClaims(t).getPayload().getSubject());
  }
}

@Component
class JwtFilter extends OncePerRequestFilter {
  private final JwtService jwt;

  JwtFilter(JwtService j) {
    jwt = j;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String h = req.getHeader("Authorization");
    if (h != null && h.startsWith("Bearer ")) {
      try {
        SecurityContextHolder.getContext()
            .setAuthentication(new UsernamePasswordAuthenticationToken(jwt.parse(h.substring(7)), null, List.of()));
      } catch (Exception ignored) {
      }
    }
    chain.doFilter(req, res);
  }
}

@Configuration
class SecurityConfig {
  @Bean
  SecurityFilterChain chain(HttpSecurity http, JwtFilter f) throws Exception {
    http.csrf(c -> c.disable()).cors(Customizer.withDefaults())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            a -> a.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll().requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/journeys/mine").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/journeys", "/api/journeys/*", "/api/routes").permitAll()
                .anyRequest().authenticated())
        .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
        .addFilterBefore(f, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  PasswordEncoder encoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean("corsConfigurationSource")
  CorsConfigurationSource corsConfigurationSource(@Value("${app.cors-origin}") String o) {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOriginPatterns(List.of(o, "http://localhost:*", "http://127.0.0.1:*"));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
  }
}
