package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.dto.request.ChangeLoginPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.ChangeMasterPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.UpdateProfileRequest;
import com.bhushan.securecredentialorganizer.dto.response.ProfileResponse;

public interface ProfileService {

    ProfileResponse getProfile();

    ProfileResponse updateProfile(
            UpdateProfileRequest request
    );

    void changeLoginPassword(
            ChangeLoginPasswordRequest request
    );

    void changeMasterPassword(
            ChangeMasterPasswordRequest request
    );
}
