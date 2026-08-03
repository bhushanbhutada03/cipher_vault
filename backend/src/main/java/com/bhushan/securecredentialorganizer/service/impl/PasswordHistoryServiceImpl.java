package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.response.PasswordHistoryResponse;
import com.bhushan.securecredentialorganizer.encryption.EncryptionService;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.entity.WebsiteCredential;
import com.bhushan.securecredentialorganizer.repository.PasswordHistoryRepository;
import com.bhushan.securecredentialorganizer.repository.WebsiteCredentialRepository;
import com.bhushan.securecredentialorganizer.security.CustomUserDetails;
import com.bhushan.securecredentialorganizer.service.PasswordHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Arrays;
import com.bhushan.securecredentialorganizer.encryption.CredentialCryptoService;
import com.bhushan.securecredentialorganizer.encryption.VaultTokenService;

@Service
@RequiredArgsConstructor
public class PasswordHistoryServiceImpl
        implements PasswordHistoryService {

    private final PasswordHistoryRepository historyRepository;
    private final WebsiteCredentialRepository credentialRepository;
    private final EncryptionService encryptionService;
    private final CredentialCryptoService cryptoService;
    private final VaultTokenService vaultTokenService;

    @Override
    public List<PasswordHistoryResponse> getHistory(Long credentialId, String vaultToken) {

        User user = ((CustomUserDetails)
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getPrincipal()).getUser();

        byte[] dek = vaultTokenService.extractDek(vaultToken, user.getTokenVersion());

        try {
            WebsiteCredential credential =
                    credentialRepository.findByIdAndUser(
                            credentialId,
                            user
                    ).orElseThrow(() ->
                            new RuntimeException("Credential not found."));

            return historyRepository
                    .findByCredentialOrderByChangedAtDesc(
                            credential)
                    .stream()
                    .map(history ->
                            PasswordHistoryResponse.builder()
                                    .oldPassword(
                                            cryptoService.decryptField(
                                                    history.getOldPasswordEncrypted(), dek, user.getId(), credential.getCredentialUuid(), "password"))
                                    .changedAt(
                                            history.getChangedAt())
                                    .build())
                    .toList();
        } finally {
            Arrays.fill(dek, (byte) 0);
        }
    }
}