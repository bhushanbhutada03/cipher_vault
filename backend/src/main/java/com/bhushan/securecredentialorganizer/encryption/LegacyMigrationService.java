package com.bhushan.securecredentialorganizer.encryption;

import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class LegacyMigrationService {

    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final KeyDerivationService kdfService;
    private final RecoveryKeyService recoveryKeyService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateAndPersistDek(Long userId, byte[] masterKek, byte[] kdfSalt) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getEncryptedDekMaster() != null) {
            return null; // Already migrated by another thread
        }

        byte[] dek = new byte[32];
        new SecureRandom().nextBytes(dek);

        char[] rkChars = null;
        byte[] recoveryKek = null;

        try {
            // Wrap DEK with Master KEK
            byte[] encMaster = encryptionService.encryptGcm(dek, masterKek, null);
            user.setEncryptedDekMaster(Base64.getEncoder().encodeToString(encMaster));

            // Generate Recovery Key and KEK
            String recoveryKey = recoveryKeyService.generateRecoveryKey();
            rkChars = recoveryKey.toCharArray();
            recoveryKek = kdfService.deriveKey(rkChars, kdfSalt);

            // Wrap DEK with Recovery KEK
            byte[] encRecovery = encryptionService.encryptGcm(dek, recoveryKek, null);
            user.setEncryptedDekRecovery(Base64.getEncoder().encodeToString(encRecovery));

            userRepository.save(user); // Triggers optimistic locking

            return recoveryKey;
        } finally {
            if (dek != null) {
                Arrays.fill(dek, (byte) 0);
            }
            if (rkChars != null) {
                Arrays.fill(rkChars, '\0');
            }
            if (recoveryKek != null) {
                Arrays.fill(recoveryKek, (byte) 0);
            }
        }
    }
}
