package com.photocopy.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.photocopy.backend.entity.PendingSignup;

public interface PendingSignupRepository extends JpaRepository<PendingSignup, Long> {
    Optional<PendingSignup> findByEmail(String email);
    void deleteByEmail(String email);
}
