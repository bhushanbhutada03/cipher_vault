package com.bhushan.securecredentialorganizer.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "aes")
public class EncryptionProperties {

    private String secretKey;

    private java.util.List<String> vaultTokenKeys = new java.util.ArrayList<>();

    @PostConstruct
    public void validate() {

        if (secretKey == null || secretKey.length() != 16) {
            throw new IllegalStateException(
                    "AES secret key must contain exactly 16 characters."
            );
        }
        
        if (vaultTokenKeys == null || vaultTokenKeys.isEmpty()) {
            throw new IllegalStateException("At least one vault token key is required.");
        }
        
        for (String key : vaultTokenKeys) {
            if (key.length() != 16 && key.length() != 32) {
                throw new IllegalStateException("Vault token keys must be exactly 16 or 32 characters.");
            }
        }
    }
}
