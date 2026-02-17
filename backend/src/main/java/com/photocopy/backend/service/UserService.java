package com.photocopy.backend.service;

import org.springframework.http.ResponseEntity;

import com.photocopy.backend.dto.request.LoginRequest;
import com.photocopy.backend.dto.request.SignupRequest;
import com.photocopy.backend.dto.response.AuthResponse;
import com.photocopy.backend.dto.response.UserResponse;

public interface UserService {
    public ResponseEntity<Void> preSignup(SignupRequest request);

    AuthResponse signup(SignupRequest request);

    UserResponse getUserById(Long id);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);
    
    void logout(String refreshToken);
}
