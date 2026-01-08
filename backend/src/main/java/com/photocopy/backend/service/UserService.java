package com.photocopy.backend.service;

import com.photocopy.backend.dto.request.UserRequest;
import com.photocopy.backend.dto.response.AuthResponse;
import com.photocopy.backend.dto.response.UserResponse;

public interface UserService {
    
    AuthResponse signup(UserRequest request);

    UserResponse getUserById(Long id);

    AuthResponse login(UserRequest request);
}
