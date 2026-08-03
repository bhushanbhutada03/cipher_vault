package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.service.OtpService;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpServiceImpl implements OtpService {

    private final SecureRandom random = new SecureRandom();

    @Override
    public String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    @Override
    public LocalDateTime getExpiryTime() {
        return LocalDateTime.now().plusMinutes(10);
    }
}
