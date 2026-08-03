package com.bhushan.securecredentialorganizer.encryption;

import java.util.Base64;
import com.bhushan.securecredentialorganizer.exception.CryptoOperationException;

public class CiphertextVersionManager {

    /**
     * Determines the encryption version of a given ciphertext string.
     * V1 format is simply a raw Base64 encoded string.
     * Future formats (V2) will have distinct prefixes (e.g., "V2$").
     */
    public static CryptoVersion getVersion(String ciphertext) {
        if (ciphertext == null || ciphertext.trim().isEmpty()) {
            return CryptoVersion.INVALID;
        }
        
        if (ciphertext.startsWith("V2$")) {
            return CryptoVersion.V2;
        }
        
        // Try parsing as Base64. If it's valid Base64 and not tagged V2, it's legacy.
        try {
            Base64.getDecoder().decode(ciphertext);
            return CryptoVersion.LEGACY;
        } catch (IllegalArgumentException e) {
            return CryptoVersion.INVALID;
        }
    }

    /**
     * Decodes a legacy ciphertext into its raw byte array.
     */
    public static byte[] decodeLegacy(String ciphertext) {
        if (getVersion(ciphertext) != CryptoVersion.LEGACY) {
            throw new CryptoOperationException("Ciphertext is not a valid LEGACY format.");
        }
        return Base64.getDecoder().decode(ciphertext);
    }
}
