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
        OTP_VERIFICATION,
        VAULT_UNLOCK
    }

    private static class AttemptRecord {
        java.util.concurrent.atomic.AtomicInteger failedAttempts = new java.util.concurrent.atomic.AtomicInteger(0);
        volatile LocalDateTime lockedUntil = null;
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
                record.failedAttempts.set(0);
                record.lockedUntil = null;
            }
        }
    }

    public int recordFailedAttempt(Scope scope, String identifier, int maxAttempts, long lockDurationSeconds) {
        String key = generateKey(scope, identifier);
        AttemptRecord record = attemptCache.computeIfAbsent(key, k -> new AttemptRecord());
        int currentAttempts = record.failedAttempts.incrementAndGet();

        if (currentAttempts >= maxAttempts) {
            record.lockedUntil = LocalDateTime.now().plusSeconds(lockDurationSeconds);
            throw new BruteForceLockedException(
                    "Too many failed attempts. Try again later.",
                    lockDurationSeconds
            );
        }

        return maxAttempts - currentAttempts;
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
