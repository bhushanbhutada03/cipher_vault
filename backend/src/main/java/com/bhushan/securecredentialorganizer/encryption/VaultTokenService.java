package com.bhushan.securecredentialorganizer.encryption;

import com.bhushan.securecredentialorganizer.config.EncryptionProperties;
import com.bhushan.securecredentialorganizer.dto.VaultToken;
import com.bhushan.securecredentialorganizer.exception.CryptoOperationException;
import tools.jackson.databind.json.JsonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VaultTokenService {

    private final EncryptionService encryptionService;
    private final EncryptionProperties encryptionProperties;
    private final JsonMapper objectMapper;

    private static final long EXPIRATION_SECONDS = 15 * 60; // 15 minutes
    private static final byte[] AAD = "vault_token".getBytes(StandardCharsets.UTF_8);

    public String generateToken(byte[] dek, int tokenVersion) {
        try {
            VaultToken vaultToken = VaultToken.builder()
                    .dek(Base64.getEncoder().encodeToString(dek))
                    .tv(tokenVersion)
                    .exp(Instant.now().getEpochSecond() + EXPIRATION_SECONDS)
                    .build();

            String jsonPayload = objectMapper.writeValueAsString(vaultToken);

            List<String> keys = encryptionProperties.getVaultTokenKeys();
            if (keys == null || keys.isEmpty()) {
                throw new CryptoOperationException("No Vault Token Keys configured");
            }
            
            byte[] activeKey = keys.get(0).getBytes(StandardCharsets.UTF_8);

            return encryptionService.encryptGcm(jsonPayload, activeKey, AAD);
        } catch (Exception e) {
            throw new CryptoOperationException("Failed to generate VaultToken", e);
        }
    }

    public byte[] extractDek(String tokenStr, int currentTokenVersion) {
        List<String> keys = encryptionProperties.getVaultTokenKeys();
        if (keys == null || keys.isEmpty()) {
            throw new CryptoOperationException("No Vault Token Keys configured");
        }

        String decryptedJson = null;
        for (String keyStr : keys) {
            try {
                byte[] key = keyStr.getBytes(StandardCharsets.UTF_8);
                decryptedJson = encryptionService.decryptGcm(tokenStr, key, AAD);
                break;
            } catch (Exception ignored) {
                // Try next key for zero-downtime rotation
            }
        }

        if (decryptedJson == null) {
            throw new CryptoOperationException("Invalid or corrupted VaultToken");
        }

        try {
            VaultToken vaultToken = objectMapper.readValue(decryptedJson, VaultToken.class);

            if (vaultToken.getTv() != currentTokenVersion) {
                throw new CryptoOperationException("VaultToken has been revoked");
            }

            if (Instant.now().getEpochSecond() > vaultToken.getExp()) {
                throw new CryptoOperationException("VaultToken has expired");
            }

            return Base64.getDecoder().decode(vaultToken.getDek());
        } catch (Exception e) {
            throw new CryptoOperationException("Failed to process VaultToken", e);
        }
    }
}
