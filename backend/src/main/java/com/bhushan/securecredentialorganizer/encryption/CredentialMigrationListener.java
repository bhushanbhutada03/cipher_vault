package com.bhushan.securecredentialorganizer.encryption;

import com.bhushan.securecredentialorganizer.entity.WebsiteCredential;
import com.bhushan.securecredentialorganizer.repository.WebsiteCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class CredentialMigrationListener {

    private final WebsiteCredentialRepository repository;
    private final CredentialCryptoService cryptoService;

    @Async
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleMigrationEvent(CredentialMigrationEvent event) {
        try {
            WebsiteCredential credential = repository.findById(event.getCredentialId()).orElse(null);
            if (credential == null) {
                return;
            }

            // Encrypt plaintexts with V2 format and the DEK
            credential.setUsernameEncrypted(
                    cryptoService.encryptField(event.getUsernamePlain(), event.getDek(), event.getUserId(), event.getCredentialUuid(), "username")
            );
            credential.setEmailEncrypted(
                    cryptoService.encryptField(event.getEmailPlain(), event.getDek(), event.getUserId(), event.getCredentialUuid(), "email")
            );
            credential.setPasswordEncrypted(
                    cryptoService.encryptField(event.getPasswordPlain(), event.getDek(), event.getUserId(), event.getCredentialUuid(), "password")
            );
            credential.setNotesEncrypted(
                    cryptoService.encryptField(event.getNotesPlain(), event.getDek(), event.getUserId(), event.getCredentialUuid(), "notes")
            );

            repository.save(credential);
        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            // Valid concurrent migration, safely ignore
        } finally {
            Arrays.fill(event.getDek(), (byte) 0);
        }
    }
}
