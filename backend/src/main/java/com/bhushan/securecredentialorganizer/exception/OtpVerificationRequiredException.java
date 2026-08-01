package com.bhushan.securecredentialorganizer.exception;

public class OtpVerificationRequiredException extends RuntimeException {

    public OtpVerificationRequiredException(String message) {
        super(message);
    }

}