package com.bhushan.securecredentialorganizer.exception;

public class BruteForceLockedException extends RuntimeException {

    private final long remainingSeconds;

    public BruteForceLockedException(String message, long remainingSeconds) {
        super(message);
        this.remainingSeconds = remainingSeconds;
    }

    public long getRemainingSeconds() {
        return remainingSeconds;
    }
}
