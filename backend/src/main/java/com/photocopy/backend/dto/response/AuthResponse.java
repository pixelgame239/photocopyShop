package com.photocopy.backend.dto.response;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    UserResponse userData
) {}
