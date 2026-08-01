package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.exception.BruteForceLockedException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BruteForceProtectionService {

    public enum Scope {
        LOGIN,
        MASTER_PASSWORD,
        FORGOT_PASSWORD,
        OTP_VERIFICATION
    }

    private static class AttemptRecord {
        int failedAttempts = 0;
        LocalDateTime lockedUntil = null;
    }

    private final ConcurrentHashMap<String, AttemptRecord> attemptCache = new ConcurrentHashMap<>();

    private String generateKey(Scope scope, String identifier) {
        return scope.name() + ":" + identifier;
    }

    public void checkLock(Scope scope, String identifier) {
        String key = generateKey(scope, identifier);
        AttemptRecord record = attemptCache.get(key);
        if (record != null && record.lockedUntil != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(record.lockedUntil)) {
                long remainingSeconds = Duration.between(now, record.lockedUntil).getSeconds();
                throw new BruteForceLockedException(
                        "Too many failed attempts. Try again later.",
                        remainingSeconds
                );
            } else {
                record.failedAttempts = 0;
                record.lockedUntil = null;
            }
        }
    }

    public int recordFailedAttempt(Scope scope, String identifier, int maxAttempts, long lockDurationSeconds) {
        String key = generateKey(scope, identifier);
        AttemptRecord record = attemptCache.computeIfAbsent(key, k -> new AttemptRecord());
        record.failedAttempts++;

        if (record.failedAttempts >= maxAttempts) {
            record.lockedUntil = LocalDateTime.now().plusSeconds(lockDurationSeconds);
            throw new BruteForceLockedException(
                    "Too many failed attempts. Try again later.",
                    lockDurationSeconds
            );
        }

        return maxAttempts - record.failedAttempts;
    }

    public void resetAttempts(Scope scope, String identifier) {
        String key = generateKey(scope, identifier);
        attemptCache.remove(key);
    }
    
    public long getRemainingLockSeconds(Scope scope, String identifier) {
        String key = generateKey(scope, identifier);
        AttemptRecord record = attemptCache.get(key);
        if (record != null && record.lockedUntil != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(record.lockedUntil)) {
                return Duration.between(now, record.lockedUntil).getSeconds();
            }
        }
        return 0;
    }
}
