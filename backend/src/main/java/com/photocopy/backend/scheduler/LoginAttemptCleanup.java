package com.photocopy.backend.scheduler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.photocopy.backend.service.LoginAttemptService;

@Component
public class LoginAttemptCleanup {

    private final LoginAttemptService service;

    public LoginAttemptCleanup(LoginAttemptService service) {
        this.service = service;
    }

    @Scheduled(fixedRate = 10 * 60 * 1000)
    public void cleanup() {
        service.cleanupExpired();
    }
}
