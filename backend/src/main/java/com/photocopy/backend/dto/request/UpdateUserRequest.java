package com.photocopy.backend.dto.request;

import lombok.Getter;

@Getter
public class UpdateUserRequest {
    private String phoneNumber;
    private String address;
    private String currentPassword;
    private String newPassword;
    private String resetToken;
    private String email;
}
