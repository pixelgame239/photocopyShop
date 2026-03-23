package com.photocopy.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.photocopy.backend.entity.UserCart;

@Repository
public interface UserCartRepository extends JpaRepository<UserCart, Long> {
    List<UserCart> findByUserId(Long userId);
    int countByUserId(Long userId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    Optional<UserCart> findByUserIdAndProductId(Long userId, Long productId);
    void deleteAllByUserId(Long userId);
}
