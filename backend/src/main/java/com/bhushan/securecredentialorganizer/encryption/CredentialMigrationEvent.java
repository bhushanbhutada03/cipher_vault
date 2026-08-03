package com.bhushan.securecredentialorganizer.encryption;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CredentialMigrationEvent {
    private final Long credentialId;
    private final Long userId;
    private final String credentialUuid;
    private final String usernamePlain;
    private final String emailPlain;
    private final String passwordPlain;
    private final String notesPlain;
    private final byte[] dek;
}
