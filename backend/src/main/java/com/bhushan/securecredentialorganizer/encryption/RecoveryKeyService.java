package com.bhushan.securecredentialorganizer.encryption;

import com.bhushan.securecredentialorganizer.exception.CryptoOperationException;
import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;

@Service
public class RecoveryKeyService {

    private final SecureRandom secureRandom = new SecureRandom();
    
    // Standard Base32 for backwards compatibility
    private final Base32 standardBase32 = new Base32();
    
    // Custom unambiguous alphabet (excluding O, 0, I, 1, L)
    private static final byte[] CUSTOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".getBytes();

    // Manual custom base32 encode/decode logic for the 32-char alphabet
    private String customEncode(byte[] data) {
        // We can just use standard base32 and map the characters!
        String standardEncoded = standardBase32.encodeAsString(data).replace("=", "").toUpperCase();
        // Standard alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ234567
        // Custom alphabet:   ABCDEFGHJKLMNPQRSTUVWXYZ23456789
        // So we translate each character
        String standardAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        String customAlphabet   = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        for (char c : standardEncoded.toCharArray()) {
            int idx = standardAlphabet.indexOf(c);
            if (idx >= 0) {
                sb.append(customAlphabet.charAt(idx));
            }
        }
        return sb.toString();
    }

    private byte[] customDecode(String encoded) {
        String standardAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        String customAlphabet   = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        for (char c : encoded.toCharArray()) {
            int idx = customAlphabet.indexOf(c);
            if (idx >= 0) {
                sb.append(standardAlphabet.charAt(idx));
            } else {
                throw new IllegalArgumentException("Invalid character");
            }
        }
        return standardBase32.decode(sb.toString());
    }

    public String generateRecoveryKey() {
        try {
            byte[] entropy = new byte[32];
            secureRandom.nextBytes(entropy);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(entropy);
            
            byte[] combined = new byte[34];
            System.arraycopy(entropy, 0, combined, 0, 32);
            combined[32] = hash[0];
            combined[33] = hash[1];

            String encoded = customEncode(combined);

            StringBuilder formatted = new StringBuilder();
            for (int i = 0; i < encoded.length(); i++) {
                if (i > 0 && i % 5 == 0) {
                    formatted.append("-");
                }
                formatted.append(encoded.charAt(i));
            }
            return formatted.toString();
        } catch (Exception e) {
            throw new CryptoOperationException("Failed to generate Recovery Key", e);
        }
    }

    public boolean validateRecoveryKey(String formattedKey) {
        if (formattedKey == null || formattedKey.isBlank()) {
            return false;
        }

        try {
            String clean = formattedKey.replace("-", "").toUpperCase();
            if (clean.length() != 55) {
                return false;
            }

            // Try decoding with custom alphabet first
            byte[] decoded;
            try {
                decoded = customDecode(clean);
            } catch (Exception e) {
                // Fallback to standard Base32 (for backwards compatibility)
                decoded = standardBase32.decode(clean);
            }

            if (decoded.length != 34) {
                return false;
            }

            byte[] entropy = Arrays.copyOfRange(decoded, 0, 32);
            byte[] providedChecksum = Arrays.copyOfRange(decoded, 32, 34);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] expectedHash = digest.digest(entropy);

            return providedChecksum[0] == expectedHash[0] && providedChecksum[1] == expectedHash[1];
        } catch (Exception e) {
            return false;
        }
    }
}
