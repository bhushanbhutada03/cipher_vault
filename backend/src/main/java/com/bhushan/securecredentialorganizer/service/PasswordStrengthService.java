package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.dto.request.PasswordStrengthRequest;
import com.bhushan.securecredentialorganizer.dto.response.PasswordStrengthResponse;

public interface PasswordStrengthService {

    PasswordStrengthResponse checkStrength(
            PasswordStrengthRequest request
    );
}