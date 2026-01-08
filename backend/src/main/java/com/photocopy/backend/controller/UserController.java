package com.photocopy.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.photocopy.backend.dto.request.UserRequest;
import com.photocopy.backend.dto.response.AuthResponse;
import com.photocopy.backend.dto.response.UserResponse;
import com.photocopy.backend.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody UserRequest request) {
        return userService.signup(request);
    }
    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }
    @PostMapping("/login")
    public AuthResponse login(@RequestBody UserRequest request) {
        return userService.login(request);

    }
    
    
}
