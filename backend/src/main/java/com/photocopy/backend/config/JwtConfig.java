package com.photocopy.backend.config;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.jsonwebtoken.security.Keys;

@Configuration
public class JwtConfig {
    @Bean
    public SecretKey jwtSecretKey(@Value("${jwt.secret}") String secret){
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    @Bean("jwtExpiration")
    public long jwtExpiration(@Value("${jwt.expiration}") long expiration){
        return expiration;
    }
    @Bean("jwtRefreshExpiration")
    public long jwtRefreshExpiration(@Value("${jwt.refresh-expiration}") long refreshExpiration){
        return refreshExpiration;
    }
}
