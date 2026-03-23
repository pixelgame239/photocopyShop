package com.photocopy.backend.scheduler;

import java.time.Instant;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.photocopy.backend.repository.PendingSignupRepository;
import com.photocopy.backend.repository.ResetPasswordRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PendingSignupResetPasswordCleanup {
    private final PendingSignupRepository pendingRepository;
    private final ResetPasswordRepository resetPasswordRepository;
    @Scheduled(fixedRate = 60 * 1000) 
    @Transactional
    public void cleanupPendingSignupAndResetPassword() {
        pendingRepository.deleteExpired(Instant.now());
        resetPasswordRepository.deleteExpired(Instant.now());
    }
}
