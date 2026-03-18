package com.photocopy.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.photocopy.backend.entity.UserCart;

public interface UserCartRepository extends JpaRepository<UserCart, Long> {
    List<UserCart> findByUserId(Long userId);
    int countByUserId(Long userId);
}
