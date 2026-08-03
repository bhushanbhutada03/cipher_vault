package com.bhushan.securecredentialorganizer.encryption;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import com.bhushan.securecredentialorganizer.exception.CryptoOperationException;

@Service
@RequiredArgsConstructor
public class CredentialCryptoService {

    private final EncryptionService encryptionService;

    public String encryptField(String plainText, byte[] dek, Long userId, String credentialUuid, String fieldName) {
        if (plainText == null) return null;
        byte[] aad = buildAad(userId, credentialUuid, fieldName);
        return "V2$" + encryptionService.encryptGcm(plainText, dek, aad);
    }

    public String decryptField(String cipherText, byte[] dek, Long userId, String credentialUuid, String fieldName) {
        if (cipherText == null) return null;
        
        CryptoVersion version = CiphertextVersionManager.getVersion(cipherText);
        
        if (version == CryptoVersion.LEGACY) {
            return encryptionService.decrypt(cipherText);
        } else if (version == CryptoVersion.V2) {
            String actualCiphertext = cipherText.substring(3);
            byte[] aad = buildAad(userId, credentialUuid, fieldName);
            return encryptionService.decryptGcm(actualCiphertext, dek, aad);
        } else {
            throw new CryptoOperationException("Unknown ciphertext format");
        }
    }

    private byte[] buildAad(Long userId, String credentialUuid, String fieldName) {
        String aadStr = userId + ":" + credentialUuid + ":" + fieldName;
        return aadStr.getBytes(StandardCharsets.UTF_8);
    }
}
