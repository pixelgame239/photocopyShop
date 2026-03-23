package com.photocopy.backend.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.photocopy.backend.entity.ResetPassword;

@Repository
public interface ResetPasswordRepository extends JpaRepository<ResetPassword, Long> {
    void deleteByEmail(String email);
    @Modifying
    @Query("DELETE FROM ResetPassword r WHERE r.expiresAt < :now")
    void deleteExpired(@Param("now") Instant now);
    Optional<ResetPassword> findByResetToken(String resetToken);
}
