package com.photocopy.backend.service;

import com.photocopy.backend.dto.request.UserRequest;
import com.photocopy.backend.dto.response.UserResponse;

public interface UserService {
    
    UserResponse createUser(UserRequest request);

    UserResponse getUserById(Long id);
}
