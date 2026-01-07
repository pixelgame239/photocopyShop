package com.photocopy.backend.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.photocopy.backend.constant.UserRole;
import com.photocopy.backend.dto.request.UserRequest;
import com.photocopy.backend.dto.response.UserResponse;
import com.photocopy.backend.entity.User;
import com.photocopy.backend.mapper.UserMapper;
import com.photocopy.backend.repository.UserRepository;
import com.photocopy.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(UserRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Unexpected Error");
        }
        User user = User.builder()
                            .email(request.getEmail())
                            .password(passwordEncoder.encode(request.getPassword()))
                            .role(UserRole.USER)
                            .fullName(request.getFullName())
                            .phoneNumber(request.getPhoneNumber())
                            .build();
        return UserMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse getUserById(Long id){
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("Unexpected Error"));
        return UserMapper.toResponse(user);
    }
}
