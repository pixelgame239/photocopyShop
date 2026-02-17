package com.photocopy.backend.service;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPT = 5;
    private static final long LOCK_TIME_DURATION = 5 * 60 * 1000; 

    private static class AttemptInfo {
        int attempts;
        long lastAttemptTime;
    }

    private final Map<String, AttemptInfo> attemptsCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String email) {
        attemptsCache.remove(email);
    }

    public void loginFailed(String email) {
        AttemptInfo info = attemptsCache.getOrDefault(email, new AttemptInfo());

        if (isExpired(info)) {
            info.attempts = 0;
        }

        info.attempts++;
        info.lastAttemptTime = Instant.now().toEpochMilli();

        attemptsCache.put(email, info);
    }

    public boolean isBlocked(String email) {
        AttemptInfo info = attemptsCache.get(email);

        if (info == null) {
            return false;
        }

        if (isExpired(info)) {
            attemptsCache.remove(email);
            return false;
        }

        return info.attempts >= MAX_ATTEMPT;
    }

    private boolean isExpired(AttemptInfo info) {
        return Instant.now().toEpochMilli() - info.lastAttemptTime > LOCK_TIME_DURATION;
    }

    public void cleanupExpired() {
        attemptsCache.entrySet().removeIf(entry ->
                isExpired(entry.getValue())
        );
    }
}
