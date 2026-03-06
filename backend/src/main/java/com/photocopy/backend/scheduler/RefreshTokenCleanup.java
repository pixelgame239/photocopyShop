package com.photocopy.backend.scheduler;

import java.time.Instant;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import com.photocopy.backend.repository.RefreshTokenRepository;

import jakarta.transaction.Transactional;

@Component
@RequiredArgsConstructor
public class RefreshTokenCleanup {
    private final RefreshTokenRepository repository;
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupRefreshTokens() {
        repository.deleteByRevokedTrueAndExpiresAtBefore(Instant.now());
    }
}
