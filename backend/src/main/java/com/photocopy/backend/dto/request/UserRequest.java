package com.photocopy.backend.dto.request;

import lombok.Getter;

@Getter
public class UserRequest {
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
}
