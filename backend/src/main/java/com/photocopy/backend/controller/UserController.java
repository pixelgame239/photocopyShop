package com.photocopy.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.photocopy.backend.dto.request.LoginRequest;
import com.photocopy.backend.dto.request.SignupRequest;
import com.photocopy.backend.dto.response.AuthResponse;
import com.photocopy.backend.dto.response.UserResponse;
import com.photocopy.backend.exception.UnauthorizedException;
import com.photocopy.backend.service.UserService;
import com.photocopy.backend.utils.CookieService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final CookieService cookieService;

    @PostMapping("/sendVerification")
    public ResponseEntity<Void> sendVerification(@Valid @RequestBody SignupRequest request, HttpServletResponse response) {
        userService.preSignup(request);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request, HttpServletResponse response) {
        AuthResponse authResponse = userService.signup(request);
        cookieService.addRefreshTokenCookie(response, authResponse.refreshToken());
        AuthResponse responseBody = new AuthResponse(
                authResponse.accessToken(),
                null,
                authResponse.userData()
        );
        return ResponseEntity.status(201).body(responseBody);
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = userService.login(request);
        cookieService.addRefreshTokenCookie(response, authResponse.refreshToken());
        AuthResponse responseBody = new AuthResponse(
                authResponse.accessToken(),
                null,
                authResponse.userData()
        );
        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(value = "refresh_token", required = false) String token, HttpServletResponse response) {
        if (token == null) {
            throw new UnauthorizedException("Refresh token missing");
        }
        AuthResponse authResponse = userService.refresh(token);
        cookieService.addRefreshTokenCookie(response, authResponse.refreshToken());
        AuthResponse responseBody = new AuthResponse(
                authResponse.accessToken(),
                null,
                authResponse.userData()
        );
        return ResponseEntity.ok(responseBody);
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Long userId, @CookieValue(value = "refresh_token", required = false) String token, HttpServletResponse response) {
        if (token == null) {
            throw new UnauthorizedException("Refresh token missing");
        }
        userService.logout(token);
        cookieService.clearRefreshTokenCookie(response);
        return ResponseEntity.ok().build();
    }
}
