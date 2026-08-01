package com.bhushan.securecredentialorganizer.exception;

public class InvalidMasterPasswordException extends RuntimeException {

    private final int remainingAttempts;

    public InvalidMasterPasswordException(String message, int remainingAttempts) {
        super(message);
        this.remainingAttempts = remainingAttempts;
    }

    public int getRemainingAttempts() {
        return remainingAttempts;
    }
}