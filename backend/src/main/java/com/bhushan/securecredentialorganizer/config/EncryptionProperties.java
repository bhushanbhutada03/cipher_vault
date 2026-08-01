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

    @PostConstruct
    public void validate() {

        if (secretKey == null || secretKey.length() != 16) {
            throw new IllegalStateException(
                    "AES secret key must contain exactly 16 characters."
            );
        }
    }
}
