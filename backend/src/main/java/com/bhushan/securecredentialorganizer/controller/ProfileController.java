package com.bhushan.securecredentialorganizer.controller;

import com.bhushan.securecredentialorganizer.dto.request.ChangeLoginPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.ChangeMasterPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.UpdateProfileRequest;
import com.bhushan.securecredentialorganizer.dto.response.ProfileResponse;
import com.bhushan.securecredentialorganizer.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ProfileResponse getProfile() {

        return profileService.getProfile();
    }

    @PutMapping
    public ProfileResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        return profileService.updateProfile(request);
    }

    @PutMapping("/login-password")
    public ResponseEntity<String> changeLoginPassword(
            @Valid @RequestBody ChangeLoginPasswordRequest request) {

        profileService.changeLoginPassword(request);

        return ResponseEntity.ok("Login password updated successfully.");
    }

    @PutMapping("/master-password")
    public ResponseEntity<String> changeMasterPassword(
            @Valid @RequestBody ChangeMasterPasswordRequest request) {

        profileService.changeMasterPassword(request);

        return ResponseEntity.ok("Master password updated successfully.");
    }
}