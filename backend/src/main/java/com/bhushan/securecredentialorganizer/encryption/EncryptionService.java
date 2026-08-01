package com.bhushan.securecredentialorganizer.encryption;

public interface EncryptionService {

    String encrypt(String plainText);

    String decrypt(String encryptedText);
}