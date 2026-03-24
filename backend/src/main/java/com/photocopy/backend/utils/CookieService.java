package com.photocopy.backend.utils;

import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletResponse;

@Component
public class CookieService {

    private static final String REFRESH_TOKEN_NAME = "refresh_token";
    private static final Duration REFRESH_TOKEN_DURATION = Duration.ofDays(7);

    public void addRefreshTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_NAME, token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(REFRESH_TOKEN_DURATION)
                .sameSite("None") 
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
