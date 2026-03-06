package com.photocopy.backend.scheduler;

import java.time.Instant;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.photocopy.backend.repository.PendingSignupRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PendingSignupCleanup {
    private final PendingSignupRepository repository;
    @Scheduled(fixedRate = 60 * 1000) 
    @Transactional
    public void cleanupPendingSignup() {
        repository.deleteExpired(Instant.now());
    }
}
