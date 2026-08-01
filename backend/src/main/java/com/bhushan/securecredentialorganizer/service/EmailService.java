package com.bhushan.securecredentialorganizer.service;

public interface EmailService {

    void sendPasswordResetOtp(String to, String otp);
}
