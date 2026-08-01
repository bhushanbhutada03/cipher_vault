package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.dto.request.PasswordGeneratorRequest;
import com.bhushan.securecredentialorganizer.dto.response.PasswordGeneratorResponse;

public interface PasswordGeneratorService {

    PasswordGeneratorResponse generatePassword(
            PasswordGeneratorRequest request
    );
}