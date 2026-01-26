package com.photocopy.backend.dto.response;

import com.photocopy.backend.constant.UserRole;

public record UserResponse(
    Long id,
    String email,
    UserRole role,
    String fullName,
    String phoneNumber,
    int userPoint
) {}
