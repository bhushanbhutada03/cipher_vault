package com.bhushan.securecredentialorganizer.encryption;

import com.bhushan.securecredentialorganizer.config.EncryptionProperties;
import com.bhushan.securecredentialorganizer.exception.CryptoOperationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.GCMParameterSpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.security.SecureRandom;
import java.nio.ByteBuffer;
import java.util.Arrays;

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
            throw new CryptoOperationException("Encryption failed", e);
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
            throw new CryptoOperationException("Decryption failed", e);
        }
    }

    @Override
    public String encrypt(String plainText, byte[] key) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"));
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new CryptoOperationException("Encryption failed", e);
        }
    }

    @Override
    public String decrypt(String encryptedText, byte[] key) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"));
            byte[] decoded = Base64.getDecoder().decode(encryptedText);
            return new String(cipher.doFinal(decoded), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new CryptoOperationException("Decryption failed", e);
        }
    }

    @Override
    public byte[] encrypt(byte[] plainText, byte[] key) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"));
            return cipher.doFinal(plainText);
        } catch (Exception e) {
            throw new CryptoOperationException("Encryption failed", e);
        }
    }

    @Override
    public byte[] decrypt(byte[] encryptedText, byte[] key) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"));
            return cipher.doFinal(encryptedText);
        } catch (Exception e) {
            throw new CryptoOperationException("Decryption failed", e);
        }
    }

    private SecretKeySpec getSecretKey() {

        String key = encryptionProperties.getSecretKey();

        if (key == null || key.length() != 16) {

            throw new CryptoOperationException(
                    "AES secret key must be exactly 16 characters."
            );

        }

        return new SecretKeySpec(
                key.getBytes(StandardCharsets.UTF_8),
                "AES"
        );
    }

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public String encryptGcm(String plainText, byte[] key, byte[] aad) {
        try {
            byte[] cipherBytes = encryptGcm(plainText.getBytes(StandardCharsets.UTF_8), key, aad);
            return Base64.getEncoder().encodeToString(cipherBytes);
        } catch (Exception e) {
            throw new CryptoOperationException("GCM Encryption failed", e);
        }
    }

    @Override
    public String decryptGcm(String encryptedText, byte[] key, byte[] aad) {
        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedText);
            byte[] plainBytes = decryptGcm(decoded, key, aad);
            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new CryptoOperationException("GCM Decryption failed", e);
        }
    }

    @Override
    public byte[] encryptGcm(byte[] plainText, byte[] key, byte[] aad) {
        try {
            byte[] iv = new byte[12];
            secureRandom.nextBytes(iv);
            
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), spec);
            if (aad != null) {
                cipher.updateAAD(aad);
            }
            
            byte[] ciphertext = cipher.doFinal(plainText);
            
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            byteBuffer.put(iv);
            byteBuffer.put(ciphertext);
            return byteBuffer.array();
        } catch (Exception e) {
            throw new CryptoOperationException("GCM Encryption failed", e);
        }
    }

    @Override
    public byte[] decryptGcm(byte[] encryptedText, byte[] key, byte[] aad) {
        try {
            ByteBuffer byteBuffer = ByteBuffer.wrap(encryptedText);
            byte[] iv = new byte[12];
            byteBuffer.get(iv);
            
            byte[] ciphertext = new byte[byteBuffer.remaining()];
            byteBuffer.get(ciphertext);
            
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), spec);
            if (aad != null) {
                cipher.updateAAD(aad);
            }
            
            return cipher.doFinal(ciphertext);
        } catch (Exception e) {
            throw new CryptoOperationException("GCM Decryption failed", e);
        }
    }
}