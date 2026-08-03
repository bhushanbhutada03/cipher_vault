package com.bhushan.securecredentialorganizer.encryption;

public interface KeyDerivationService {
    byte[] generateSalt();
    byte[] deriveKey(char[] password, byte[] salt);
}
