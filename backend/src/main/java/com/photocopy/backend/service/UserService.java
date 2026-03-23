package com.photocopy.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.photocopy.backend.dto.request.LoginRequest;
import com.photocopy.backend.dto.request.SignupRequest;
import com.photocopy.backend.dto.request.UpdateUserRequest;
import com.photocopy.backend.dto.response.AuthResponse;
import com.photocopy.backend.dto.response.UserResponse;

public interface UserService {
    ResponseEntity<Void> preSignup(SignupRequest request);

    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);
    
    void logout(String refreshToken);

    Page<UserResponse> getAllUsers(Pageable pageable, Authentication authentication);

    void changeUserStatus(Long userId, Authentication authentication);

    UserResponse createNewStaff(SignupRequest request, Authentication authentication);

    void deleteUser(Long userId, Authentication authentication);

    void updateUserProfile(UpdateUserRequest request, Authentication authentication);

    void changePassword(UpdateUserRequest request, Authentication authentication);

    void sendResetPasswordEmail(UpdateUserRequest request);

    boolean verifyResetToken(String token);

}
