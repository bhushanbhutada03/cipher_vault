package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.request.ChangeLoginPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.ChangeMasterPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.UpdateProfileRequest;
import com.bhushan.securecredentialorganizer.dto.response.ProfileResponse;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.exception.InvalidMasterPasswordException;
import com.bhushan.securecredentialorganizer.exception.InvalidPasswordException;
import com.bhushan.securecredentialorganizer.repository.UserRepository;
import com.bhushan.securecredentialorganizer.security.CustomUserDetails;
import com.bhushan.securecredentialorganizer.service.BruteForceProtectionService;
import com.bhushan.securecredentialorganizer.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BruteForceProtectionService attemptService;

    @Override
    public ProfileResponse getProfile() {

        User user = getCurrentUser();

        return ProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public ProfileResponse updateProfile(UpdateProfileRequest request) {

        User user = getCurrentUser();

        user.setFullName(request.getFullName());

        userRepository.save(user);

        return ProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public void changeLoginPassword(ChangeLoginPasswordRequest request) {

        User user = getCurrentUser();

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getLoginPasswordHash())) {

            throw new InvalidPasswordException("Current password is incorrect.");
        }

        user.setLoginPasswordHash(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changeMasterPassword(ChangeMasterPasswordRequest request) {

        User user = getCurrentUser();
        String identifier = String.valueOf(user.getId());

        attemptService.checkLock(BruteForceProtectionService.Scope.MASTER_PASSWORD, identifier);

        if (!passwordEncoder.matches(
                request.getCurrentMasterPassword(),
                user.getMasterPasswordHash())) {

            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.MASTER_PASSWORD, 
                    identifier, 
                    3, 
                    60
            );

            throw new InvalidMasterPasswordException("Current master password is incorrect.", remaining);
        }

        attemptService.resetAttempts(BruteForceProtectionService.Scope.MASTER_PASSWORD, identifier);

        // Architecture Constraint Note:
        // Re-encryption of WebsiteCredential and PasswordHistory cannot be performed here.
        // The existing EncryptionService uses a global, static SecretKey injected via application.properties.
        // It does not use the user's Master Password as a cryptographic key.
        // The Master Password currently acts solely as an authentication gate (verified via BCrypt hash matching).
        // Therefore, we only need to update the hash. The encrypted data remains safely encrypted by the global key.

        user.setMasterPasswordHash(
                passwordEncoder.encode(request.getNewMasterPassword())
        );

        userRepository.save(user);
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return userDetails.getUser();
    }
}