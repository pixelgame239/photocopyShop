package com.photocopy.backend.mapper;

import com.photocopy.backend.dto.response.UserResponse;
import com.photocopy.backend.entity.User;

public class UserMapper {
    private UserMapper() {}

    public static UserResponse toResponse(User user, int cartItemCount) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getUserPoint(),
                user.isActive(),
                user.getAddress(),
                cartItemCount
        );
    }
}
