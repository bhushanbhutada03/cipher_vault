package com.bhushan.securecredentialorganizer.encryption;

public interface EncryptionService {

    String encrypt(String plainText);

    String decrypt(String encryptedText);

    String encrypt(String plainText, byte[] key);
    
    String decrypt(String encryptedText, byte[] key);

    byte[] encrypt(byte[] plainText, byte[] key);

    byte[] decrypt(byte[] encryptedText, byte[] key);

    String encryptGcm(String plainText, byte[] key, byte[] aad);

    String decryptGcm(String encryptedText, byte[] key, byte[] aad);

    byte[] encryptGcm(byte[] plainText, byte[] key, byte[] aad);

    byte[] decryptGcm(byte[] encryptedText, byte[] key, byte[] aad);
}