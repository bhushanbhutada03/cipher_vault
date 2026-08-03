package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.request.VaultUnlockRequest;
import com.bhushan.securecredentialorganizer.dto.request.RegenerateRecoveryKeyRequest;
import com.bhushan.securecredentialorganizer.dto.response.VaultUnlockResponse;
import com.bhushan.securecredentialorganizer.dto.response.RegenerateRecoveryKeyResponse;
import com.bhushan.securecredentialorganizer.encryption.EncryptionService;
import com.bhushan.securecredentialorganizer.encryption.KeyDerivationService;
import com.bhushan.securecredentialorganizer.encryption.VaultTokenService;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.exception.CryptoOperationException;
import com.bhushan.securecredentialorganizer.exception.InvalidCredentialsException;
import com.bhushan.securecredentialorganizer.repository.UserRepository;
import com.bhushan.securecredentialorganizer.encryption.RecoveryKeyService;
import com.bhushan.securecredentialorganizer.encryption.LegacyMigrationService;
import com.bhushan.securecredentialorganizer.service.BruteForceProtectionService;
import com.bhushan.securecredentialorganizer.service.VaultService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Base64;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VaultServiceImpl implements VaultService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final KeyDerivationService kdfService;
    private final EncryptionService encryptionService;
    private final VaultTokenService vaultTokenService;
    private final BruteForceProtectionService attemptService;
    private final RecoveryKeyService recoveryKeyService;
    private final LegacyMigrationService legacyMigrationService;

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public VaultUnlockResponse unlock(VaultUnlockRequest request, String email) {
        attemptService.checkLock(BruteForceProtectionService.Scope.VAULT_UNLOCK, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found.", 0));

        boolean match = passwordEncoder.matches(request.getMasterPassword(), user.getMasterPasswordHash());
        if (!match) {
            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.VAULT_UNLOCK,
                    email,
                    5,
                    60
            );
            throw new InvalidCredentialsException("Invalid master password.", remaining);
        }

        attemptService.resetAttempts(BruteForceProtectionService.Scope.VAULT_UNLOCK, email);

        char[] mpChars = request.getMasterPassword().toCharArray();
        byte[] masterKek = null;
        byte[] dek = null;
        String recoveryKeyToReturn = null;
        try {
            int originalTokenVersion = user.getTokenVersion();
            masterKek = kdfService.deriveKey(mpChars, user.getKdfSalt());
            
            if (user.getEncryptedDekMaster() == null) {
                // JIT Legacy User DEK Generation (Outer Transaction Safe)
                try {
                    recoveryKeyToReturn = legacyMigrationService.generateAndPersistDek(user.getId(), masterKek, user.getKdfSalt());
                } catch (ObjectOptimisticLockingFailureException e) {
                    // Another thread migrated it!
                }
                
                // Fetch the newly persisted DB state (natively bypasses MVCC snapshot because of NOT_SUPPORTED)
                User updatedUser = userRepository.findById(user.getId())
                        .orElseThrow(() -> new InvalidCredentialsException("User not found.", 0));
                
                byte[] encryptedDekMasterBytes = Base64.getDecoder().decode(updatedUser.getEncryptedDekMaster());
                dek = encryptionService.decryptGcm(encryptedDekMasterBytes, masterKek, null);
            } else {
                byte[] encryptedDekMasterBytes = Base64.getDecoder().decode(user.getEncryptedDekMaster());
                dek = encryptionService.decryptGcm(encryptedDekMasterBytes, masterKek, null);
            }
            
            String vaultToken = vaultTokenService.generateToken(dek, originalTokenVersion);
            return VaultUnlockResponse.builder()
                    .success(true)
                    .message("Vault unlocked successfully")
                    .vaultToken(vaultToken)
                    .recoveryKey(recoveryKeyToReturn)
                    .build();
        } finally {
            if (mpChars != null) {
                Arrays.fill(mpChars, '\0');
            }
            if (masterKek != null) {
                Arrays.fill(masterKek, (byte) 0);
            }
            if (dek != null) {
                Arrays.fill(dek, (byte) 0);
            }
        }
    }

    @Override
    @Transactional
    public com.bhushan.securecredentialorganizer.dto.response.RegisterResponse recover(
            com.bhushan.securecredentialorganizer.dto.request.VaultRecoverRequest request, String email) {
        
        attemptService.checkLock(BruteForceProtectionService.Scope.VAULT_UNLOCK, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found.", 0));

        if (!recoveryKeyService.validateRecoveryKey(request.getRecoveryKey())) {
            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.VAULT_UNLOCK,
                    email,
                    5,
                    60
            );
            throw new InvalidCredentialsException("Invalid recovery key.", remaining);
        }

        attemptService.resetAttempts(BruteForceProtectionService.Scope.VAULT_UNLOCK, email);

        if (user.getEncryptedDekRecovery() == null) {
            throw new CryptoOperationException("Recovery DEK missing.");
        }

        char[] rkChars = request.getRecoveryKey().toCharArray();
        byte[] recoveryKek = kdfService.deriveKey(rkChars, user.getKdfSalt());
        byte[] encryptedDekRecoveryBytes = Base64.getDecoder().decode(user.getEncryptedDekRecovery());
        
        byte[] dek = null;
        byte[] newMasterKek = null;
        try {
            dek = encryptionService.decryptGcm(encryptedDekRecoveryBytes, recoveryKek, null);

            char[] newMpChars = request.getNewMasterPassword().toCharArray();
            newMasterKek = kdfService.deriveKey(newMpChars, user.getKdfSalt());
            byte[] newEncryptedDekMasterBytes = encryptionService.encryptGcm(dek, newMasterKek, null);

            user.setEncryptedDekMaster(Base64.getEncoder().encodeToString(newEncryptedDekMasterBytes));
            user.setMasterPasswordHash(passwordEncoder.encode(request.getNewMasterPassword()));
            
            user.setTokenVersion(user.getTokenVersion() + 1);

            userRepository.save(user);

            Arrays.fill(newMpChars, '\0');
            return com.bhushan.securecredentialorganizer.dto.response.RegisterResponse.builder()
                    .success(true)
                    .message("Account recovered successfully. Please login with your new Master Password.")
                    .build();
        } finally {
            Arrays.fill(rkChars, '\0');
            Arrays.fill(recoveryKek, (byte) 0);
            if (dek != null) Arrays.fill(dek, (byte) 0);
            if (newMasterKek != null) Arrays.fill(newMasterKek, (byte) 0);
        }
    }

    @Override
    @Transactional
    public RegenerateRecoveryKeyResponse regenerateRecoveryKey(RegenerateRecoveryKeyRequest request, String email) {
        attemptService.checkLock(BruteForceProtectionService.Scope.MASTER_PASSWORD, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found.", 0));

        boolean match = passwordEncoder.matches(request.getMasterPassword(), user.getMasterPasswordHash());
        if (!match) {
            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.MASTER_PASSWORD,
                    email,
                    5,
                    60
            );
            throw new InvalidCredentialsException("Invalid master password.", remaining);
        }

        attemptService.resetAttempts(BruteForceProtectionService.Scope.MASTER_PASSWORD, email);

        if (user.getEncryptedDekMaster() == null) {
            throw new IllegalArgumentException("Vault must be unlocked once before regenerating recovery keys.");
        }

        char[] mpChars = request.getMasterPassword().toCharArray();
        byte[] masterKek = null;
        byte[] dek = null;
        char[] rkChars = null;
        byte[] recoveryKek = null;
        
        try {
            masterKek = kdfService.deriveKey(mpChars, user.getKdfSalt());
            byte[] encryptedDekMasterBytes = Base64.getDecoder().decode(user.getEncryptedDekMaster());
            dek = encryptionService.decryptGcm(encryptedDekMasterBytes, masterKek, null);

            String newRecoveryKey = recoveryKeyService.generateRecoveryKey();
            rkChars = newRecoveryKey.toCharArray();
            recoveryKek = kdfService.deriveKey(rkChars, user.getKdfSalt());
            
            byte[] newEncryptedDekRecovery = encryptionService.encryptGcm(dek, recoveryKek, null);
            user.setEncryptedDekRecovery(Base64.getEncoder().encodeToString(newEncryptedDekRecovery));
            
            userRepository.save(user);

            return RegenerateRecoveryKeyResponse.builder()
                    .success(true)
                    .message("Recovery key regenerated successfully.")
                    .recoveryKey(newRecoveryKey)
                    .build();
        } finally {
            if (mpChars != null) Arrays.fill(mpChars, '\0');
            if (masterKek != null) Arrays.fill(masterKek, (byte) 0);
            if (dek != null) Arrays.fill(dek, (byte) 0);
            if (rkChars != null) Arrays.fill(rkChars, '\0');
            if (recoveryKek != null) Arrays.fill(recoveryKek, (byte) 0);
        }
    }
}
