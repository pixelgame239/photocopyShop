package com.photocopy.backend.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.photocopy.backend.entity.PendingSignup;

@Repository
public interface PendingSignupRepository extends JpaRepository<PendingSignup, Long> {
    Optional<PendingSignup> findByEmail(String email);
    void deleteByEmail(String email);
    @Modifying
    @Query("DELETE FROM PendingSignup p WHERE p.expiresAt < :now")
    void deleteExpired(@Param("now") Instant now);
}
