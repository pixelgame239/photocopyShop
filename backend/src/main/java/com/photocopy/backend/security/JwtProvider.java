package com.photocopy.backend.security;

import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;


@Component
public class JwtProvider {
    private final SecretKey jwtSecretKey;
    private final long jwtExpiration;

    public JwtProvider(SecretKey jwtSecretKey, @Qualifier("jwtExpiration") long jwtExpiration){
        this.jwtSecretKey= jwtSecretKey;
        this.jwtExpiration= jwtExpiration;
    }
   
    public String generateToken(Long userId, String email, String role) {
        return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("email", email)
        .claim("role", role)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
        .signWith(jwtSecretKey)
        .compact();
    }
    public Claims parseToken(String token){
        return Jwts.parser().verifyWith(jwtSecretKey).build().parseSignedClaims(token).getPayload();
    }
    public String extractUserId(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }
    public String extractRole(String token) {
        Claims claims = parseToken(token);
        return claims.get("role", String.class);
    }
    public Authentication getAuthentication(String token) {
        Claims claims = parseToken(token);
        String userId = claims.getSubject();
        String role = claims.get("role", String.class);
        if (userId ==null){
            return null;
        }
        return new UsernamePasswordAuthenticationToken(userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }
}
