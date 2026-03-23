package com.photocopy.backend.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.photocopy.backend.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http.csrf(csrf->csrf.disable())
        .cors(Customizer.withDefaults())
        .exceptionHandling(ex->ex.authenticationEntryPoint((request, response, authException)->{
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Unauthorized\", \"status\": 401}");        
        }))
        .authorizeHttpRequests(auth->auth
            .requestMatchers("/api/users/login", "/api/users/signup", "/api/users/refresh", 
            "/api/users/sendVerification", "/ws/**", "/api/chat/markAsRead/**", "/api/chat/getMessages/**", 
            "/api/chat/getBoxChatStatus/**", "/api/category/**", "/api/product/**", "/api/users/sendResetPasswordEmail", "/api/users/changePassword").permitAll()
            .requestMatchers("/api/orders/changeOrderStatus", "/api/orders/exportInvoice/**", "/api/orders/getOrdersStatus").hasAnyRole("ADMIN", "STAFF", "USER")
            .requestMatchers("/api/cart/**", "/api/orders/generateQRCode", "/api/users/updateProfile", "/api/orders/getUserOrders").hasRole("USER")
            .requestMatchers("/api/chat/staff/**", "/api/orders/getAllOrders").hasAnyRole("ADMIN", "STAFF")
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
