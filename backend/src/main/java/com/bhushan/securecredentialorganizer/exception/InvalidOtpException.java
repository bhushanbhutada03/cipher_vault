package com.bhushan.securecredentialorganizer.exception;

public class InvalidOtpException extends RuntimeException {
    
    private final int remainingAttempts;

    public InvalidOtpException(String message, int remainingAttempts) {
        super(message);
        this.remainingAttempts = remainingAttempts;
    }

    public int getRemainingAttempts() {
        return remainingAttempts;
    }
}