package com.photocopy.backend.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.photocopy.backend.constant.UserRole;
import com.photocopy.backend.dto.request.UserRequest;
import com.photocopy.backend.dto.response.AuthResponse;
import com.photocopy.backend.dto.response.UserResponse;
import com.photocopy.backend.entity.User;
import com.photocopy.backend.mapper.UserMapper;
import com.photocopy.backend.repository.UserRepository;
import com.photocopy.backend.security.JwtProvider;
import com.photocopy.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Override
    public AuthResponse signup(UserRequest request){
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
        User savedUser = userRepository.save(user);
        String token = jwtProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        return new AuthResponse(token, UserMapper.toResponse(savedUser));
    }

    @Override
    public UserResponse getUserById(Long id){
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("Unexpected Error"));
        return UserMapper.toResponse(user);
    }
    @Override
    public AuthResponse login(UserRequest request){
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(()-> new RuntimeException("Tài khoản hoặc mật khẩu không đúng"));
        boolean matchedPassword = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if(!matchedPassword){
            throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng");
        }
        String token = jwtProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, UserMapper.toResponse(user));
    }
}
