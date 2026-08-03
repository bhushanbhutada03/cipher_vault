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
@Transactional(readOnly = true)
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BruteForceProtectionService attemptService;
    private final com.bhushan.securecredentialorganizer.encryption.EncryptionService encryptionService;
    private final com.bhushan.securecredentialorganizer.encryption.KeyDerivationService keyDerivationService;

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
    @Transactional
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
    @Transactional
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

        if (user.getEncryptedDekMaster() == null) {
            throw new com.bhushan.securecredentialorganizer.exception.CryptoOperationException("DEK missing. Cannot change master password until migrated to V2.");
        }

        // Unwrap DEK using OLD Master KEK
        char[] oldMpChars = request.getCurrentMasterPassword().toCharArray();
        byte[] oldMasterKek = keyDerivationService.deriveKey(oldMpChars, user.getKdfSalt());
        byte[] encryptedDekBytes = java.util.Base64.getDecoder().decode(user.getEncryptedDekMaster());
        byte[] dek = null;
        byte[] newMasterKek = null;
        try {
            dek = encryptionService.decryptGcm(encryptedDekBytes, oldMasterKek, null);

            // Wrap DEK using NEW Master KEK
            char[] newMpChars = request.getNewMasterPassword().toCharArray();
            newMasterKek = keyDerivationService.deriveKey(newMpChars, user.getKdfSalt());
            byte[] newEncryptedDekBytes = encryptionService.encryptGcm(dek, newMasterKek, null);

            user.setEncryptedDekMaster(java.util.Base64.getEncoder().encodeToString(newEncryptedDekBytes));
            user.setMasterPasswordHash(passwordEncoder.encode(request.getNewMasterPassword()));
            
            // Invalidate existing sessions
            user.setTokenVersion(user.getTokenVersion() + 1);

            userRepository.save(user);

            java.util.Arrays.fill(newMpChars, '\0');
        } finally {
            java.util.Arrays.fill(oldMpChars, '\0');
            java.util.Arrays.fill(oldMasterKek, (byte) 0);
            if (dek != null) java.util.Arrays.fill(dek, (byte) 0);
            if (newMasterKek != null) java.util.Arrays.fill(newMasterKek, (byte) 0);
        }
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return userDetails.getUser();
    }
}