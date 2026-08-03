package com.bhushan.securecredentialorganizer.service;

import java.time.LocalDateTime;

public interface OtpService {

    String generateOtp();

    LocalDateTime getExpiryTime();
}
