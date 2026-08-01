package com.bhushan.securecredentialorganizer.encryption;

import com.bhushan.securecredentialorganizer.config.EncryptionProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class EncryptionServiceImpl implements EncryptionService {

    private final EncryptionProperties encryptionProperties;

    @Override
    public String encrypt(String plainText) {

        try {

            Cipher cipher = Cipher.getInstance("AES");

            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    getSecretKey()
            );

            byte[] encrypted = cipher.doFinal(
                    plainText.getBytes(StandardCharsets.UTF_8)
            );

            return Base64.getEncoder()
                    .encodeToString(encrypted);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Encryption failed",
                    e
            );

        }
    }

    @Override
    public String decrypt(String encryptedText) {

        try {

            Cipher cipher = Cipher.getInstance("AES");

            cipher.init(
                    Cipher.DECRYPT_MODE,
                    getSecretKey()
            );

            byte[] decoded =
                    Base64.getDecoder()
                            .decode(encryptedText);

            return new String(
                    cipher.doFinal(decoded),
                    StandardCharsets.UTF_8
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Decryption failed",
                    e
            );

        }
    }

    private SecretKeySpec getSecretKey() {

        String key = encryptionProperties.getSecretKey();

        if (key == null || key.length() != 16) {

            throw new RuntimeException(
                    "AES secret key must be exactly 16 characters."
            );

        }

        return new SecretKeySpec(
                key.getBytes(StandardCharsets.UTF_8),
                "AES"
        );
    }
}