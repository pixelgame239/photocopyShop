package com.photocopy.backend.dto.response;

import com.photocopy.backend.constant.UserRole;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class UserResponse {
    private Long id;
    private String email;
    private UserRole role;
    private String fullName;
    private String phoneNumber;
}
