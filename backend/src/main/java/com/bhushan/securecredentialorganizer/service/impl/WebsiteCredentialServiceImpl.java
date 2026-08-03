package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.request.DeleteCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.request.RevealCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.request.UpdateCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.request.WebsiteCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.response.CredentialDetailResponse;
import com.bhushan.securecredentialorganizer.dto.response.CredentialListResponse;
import com.bhushan.securecredentialorganizer.encryption.EncryptionService;
import com.bhushan.securecredentialorganizer.entity.Category;
import com.bhushan.securecredentialorganizer.entity.PasswordHistory;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.entity.WebsiteCredential;
import com.bhushan.securecredentialorganizer.exception.InvalidMasterPasswordException;
import com.bhushan.securecredentialorganizer.repository.CategoryRepository;
import com.bhushan.securecredentialorganizer.repository.PasswordHistoryRepository;
import com.bhushan.securecredentialorganizer.repository.WebsiteCredentialRepository;
import com.bhushan.securecredentialorganizer.security.CustomUserDetails;
import com.bhushan.securecredentialorganizer.service.BruteForceProtectionService;
import com.bhushan.securecredentialorganizer.service.WebsiteCredentialService;
import com.bhushan.securecredentialorganizer.encryption.VaultTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.Base64;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WebsiteCredentialServiceImpl
        implements WebsiteCredentialService {

    private final WebsiteCredentialRepository websiteCredentialRepository;
    private final CategoryRepository categoryRepository;
    private final com.bhushan.securecredentialorganizer.encryption.CredentialCryptoService credentialCryptoService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final BruteForceProtectionService attemptService;
    private final VaultTokenService vaultTokenService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public void create(WebsiteCredentialRequest request, String vaultToken) {

        User user = getCurrentUser();
        byte[] dek = vaultTokenService.extractDek(vaultToken, user.getTokenVersion());

        try {
            Category category = categoryRepository
                    .findByIdAndUser(request.getCategoryId(), user)
                    .orElseThrow(() ->
                            new RuntimeException("Category not found."));
            
            String credentialUuid = UUID.randomUUID().toString();

            WebsiteCredential credential = WebsiteCredential.builder()
                    .user(user)
                    .category(category)
                    .websiteName(request.getWebsiteName())
                    .websiteUrl(request.getWebsiteUrl())
                    .credentialUuid(credentialUuid)
                    .usernameEncrypted(
                            credentialCryptoService.encryptField(
                                    request.getUsername(), dek, user.getId(), credentialUuid, "username"))
                    .emailEncrypted(
                            credentialCryptoService.encryptField(
                                    request.getEmail(), dek, user.getId(), credentialUuid, "email"))
                    .passwordEncrypted(
                            credentialCryptoService.encryptField(
                                    request.getPassword(), dek, user.getId(), credentialUuid, "password"))
                    .notesEncrypted(
                            credentialCryptoService.encryptField(
                                    request.getNotes(), dek, user.getId(), credentialUuid, "notes"))
                    .favorite(request.isFavorite())
                    .build();

            websiteCredentialRepository.save(credential);
        } finally {
            if (dek != null) Arrays.fill(dek, (byte) 0);
        }
    }

    @Override
    public List<CredentialListResponse> getAll() {

        User user = getCurrentUser();

        return websiteCredentialRepository.findByUser(user)
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    @Override
    public CredentialListResponse getById(Long id) {

        User user = getCurrentUser();

        WebsiteCredential credential = websiteCredentialRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new RuntimeException("Credential not found."));

        return mapToListResponse(credential);
    }

    @Override
    public List<CredentialListResponse> getFavorites() {

        User user = getCurrentUser();

        return websiteCredentialRepository
                .findByUserAndFavoriteTrue(user)
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    @Override
    @Transactional
    public void toggleFavorite(Long id) {

        User user = getCurrentUser();

        WebsiteCredential credential =
                websiteCredentialRepository
                        .findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Credential not found."));

        credential.setFavorite(!credential.isFavorite());

        websiteCredentialRepository.save(credential);
    }

    @Override
    public List<CredentialListResponse> search(String keyword) {

        User user = getCurrentUser();

        return websiteCredentialRepository
                .findByUserAndWebsiteNameContainingIgnoreCaseOrUserAndWebsiteUrlContainingIgnoreCase(
                        user,
                        keyword,
                        user,
                        keyword)
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    private CredentialListResponse mapToListResponse(
            WebsiteCredential credential) {

        return CredentialListResponse.builder()
                .id(credential.getId())
                .websiteName(credential.getWebsiteName())
                .websiteUrl(credential.getWebsiteUrl())
                .categoryName(
                        credential.getCategory().getCategoryName())
                .favorite(credential.isFavorite())
                .faviconUrl(credential.getFaviconUrl())
                .build();
    }

    private CredentialDetailResponse mapToDetailResponse(
            WebsiteCredential credential, byte[] dek, User user) {

        String usernamePlain = credentialCryptoService.decryptField(
                credential.getUsernameEncrypted(), dek, user.getId(), credential.getCredentialUuid(), "username");
        String emailPlain = credentialCryptoService.decryptField(
                credential.getEmailEncrypted(), dek, user.getId(), credential.getCredentialUuid(), "email");
        String passwordPlain = credentialCryptoService.decryptField(
                credential.getPasswordEncrypted(), dek, user.getId(), credential.getCredentialUuid(), "password");
        String notesPlain = credentialCryptoService.decryptField(
                credential.getNotesEncrypted(), dek, user.getId(), credential.getCredentialUuid(), "notes");

        boolean needsMigration = false;
        if (credential.getUsernameEncrypted() != null && !credential.getUsernameEncrypted().startsWith("V2$")) needsMigration = true;
        if (credential.getEmailEncrypted() != null && !credential.getEmailEncrypted().startsWith("V2$")) needsMigration = true;
        if (credential.getPasswordEncrypted() != null && !credential.getPasswordEncrypted().startsWith("V2$")) needsMigration = true;
        if (credential.getNotesEncrypted() != null && !credential.getNotesEncrypted().startsWith("V2$")) needsMigration = true;

        if (needsMigration) {
            byte[] dekCopy = Arrays.copyOf(dek, dek.length);
            com.bhushan.securecredentialorganizer.encryption.CredentialMigrationEvent event =
                    new com.bhushan.securecredentialorganizer.encryption.CredentialMigrationEvent(
                            credential.getId(),
                            user.getId(),
                            credential.getCredentialUuid(),
                            usernamePlain,
                            emailPlain,
                            passwordPlain,
                            notesPlain,
                            dekCopy
                    );
            eventPublisher.publishEvent(event);
        }

        return CredentialDetailResponse.builder()
                .id(credential.getId())
                .websiteName(credential.getWebsiteName())
                .websiteUrl(credential.getWebsiteUrl())
                .username(usernamePlain)
                .email(emailPlain)
                .password(passwordPlain)
                .notes(notesPlain)
                .categoryName(
                        credential.getCategory().getCategoryName())
                .favorite(credential.isFavorite())
                .faviconUrl(credential.getFaviconUrl())
                .build();
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return userDetails.getUser();
    }

    @Override
    public CredentialDetailResponse reveal(
            Long id,
            RevealCredentialRequest request,
            String vaultToken) {

        User user = getCurrentUser();
        byte[] dek = vaultTokenService.extractDek(vaultToken, user.getTokenVersion());

        try {
            verifyMasterPassword(
                    user,
                    request.getMasterPassword());

            WebsiteCredential credential =
                    websiteCredentialRepository
                            .findByIdAndUser(id, user)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Credential not found."));

            return mapToDetailResponse(credential, dek, user);
        } finally {
            if (dek != null) Arrays.fill(dek, (byte) 0);
        }
    }

    @Override
    @Transactional
    public CredentialDetailResponse update(
            Long id,
            UpdateCredentialRequest request,
            String vaultToken) {

        User user = getCurrentUser();
        byte[] dek = vaultTokenService.extractDek(vaultToken, user.getTokenVersion());

        try {
            verifyMasterPassword(
                    user,
                    request.getMasterPassword());

            WebsiteCredential credential =
                    websiteCredentialRepository
                            .findByIdAndUser(id, user)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Credential not found."));

            Category category =
                    categoryRepository
                            .findByIdAndUser(
                                    request.getCategoryId(),
                                    user)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Category not found."));

            credential.setCategory(category);
            credential.setWebsiteName(request.getWebsiteName());
            credential.setWebsiteUrl(request.getWebsiteUrl());

            credential.setUsernameEncrypted(
                    credentialCryptoService.encryptField(
                            request.getUsername(), dek, user.getId(), credential.getCredentialUuid(), "username"));

            credential.setEmailEncrypted(
                    credentialCryptoService.encryptField(
                            request.getEmail(), dek, user.getId(), credential.getCredentialUuid(), "email"));

            String newEncryptedPassword =
                    credentialCryptoService.encryptField(
                            request.getPassword(), dek, user.getId(), credential.getCredentialUuid(), "password");

            // Simple string comparison works for V2 ciphertext because AAD binds to same ID and field,
            // but IV will be different every time! So simple equality check will ALWAYS be false if we re-encrypt.
            // We must decrypt the old password and compare plaintexts.
            String oldPlaintextPassword = credentialCryptoService.decryptField(
                    credential.getPasswordEncrypted(), dek, user.getId(), credential.getCredentialUuid(), "password");

            if (!request.getPassword().equals(oldPlaintextPassword)) {

                PasswordHistory history =
                        PasswordHistory.builder()
                                .credential(credential)
                                .oldPasswordEncrypted(
                                        credential.getPasswordEncrypted())
                                .build();

                passwordHistoryRepository.save(history);

                credential.setPasswordEncrypted(
                        newEncryptedPassword);
            }

            credential.setNotesEncrypted(
                    credentialCryptoService.encryptField(
                            request.getNotes(), dek, user.getId(), credential.getCredentialUuid(), "notes"));

            credential.setFavorite(request.isFavorite());

            websiteCredentialRepository.save(credential);

            return mapToDetailResponse(credential, dek, user);
        } finally {
            if (dek != null) Arrays.fill(dek, (byte) 0);
        }
    }

    @Override
    @Transactional
    public void delete(
            Long id,
            DeleteCredentialRequest request) {

        User user = getCurrentUser();

        verifyMasterPassword(
                user,
                request.getMasterPassword());

        WebsiteCredential credential =
                websiteCredentialRepository
                        .findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Credential not found."));

        passwordHistoryRepository.deleteByCredential(credential);
        websiteCredentialRepository.delete(credential);
    }

    private void verifyMasterPassword(
            User user,
            String masterPassword) {

        String identifier = String.valueOf(user.getId());
        attemptService.checkLock(BruteForceProtectionService.Scope.MASTER_PASSWORD, identifier);

        if (!passwordEncoder.matches(
                masterPassword,
                user.getMasterPasswordHash())) {

            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.MASTER_PASSWORD, 
                    identifier, 
                    3, 
                    60
            );
            
            throw new InvalidMasterPasswordException(
                    "Invalid master password.", remaining
            );
        }

        attemptService.resetAttempts(BruteForceProtectionService.Scope.MASTER_PASSWORD, identifier);
    }

    @Override
    public long getMasterPasswordLockRemainingSeconds() {
        User user = getCurrentUser();
        return attemptService.getRemainingLockSeconds(
                BruteForceProtectionService.Scope.MASTER_PASSWORD, 
                String.valueOf(user.getId())
        );
    }
}