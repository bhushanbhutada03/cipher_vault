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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WebsiteCredentialServiceImpl
        implements WebsiteCredentialService {

    private final WebsiteCredentialRepository websiteCredentialRepository;
    private final CategoryRepository categoryRepository;
    private final EncryptionService encryptionService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final BruteForceProtectionService attemptService;

    @Override
    public void create(WebsiteCredentialRequest request) {

        User user = getCurrentUser();

        Category category = categoryRepository
                .findByIdAndUser(request.getCategoryId(), user)
                .orElseThrow(() ->
                        new RuntimeException("Category not found."));

        WebsiteCredential credential = WebsiteCredential.builder()
                .user(user)
                .category(category)
                .websiteName(request.getWebsiteName())
                .websiteUrl(request.getWebsiteUrl())
                .usernameEncrypted(
                        encryptionService.encrypt(
                                request.getUsername()))
                .emailEncrypted(
                        request.getEmail() == null || request.getEmail().isEmpty()
                                ? null
                                : encryptionService.encrypt(
                                request.getEmail()))
                .passwordEncrypted(
                        encryptionService.encrypt(
                                request.getPassword()))
                .notesEncrypted(
                        request.getNotes() == null
                                ? null
                                : encryptionService.encrypt(
                                request.getNotes()))
                .favorite(request.isFavorite())
                .build();

        websiteCredentialRepository.save(credential);
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
            WebsiteCredential credential) {

        return CredentialDetailResponse.builder()
                .id(credential.getId())
                .websiteName(credential.getWebsiteName())
                .websiteUrl(credential.getWebsiteUrl())
                .username(
                        encryptionService.decrypt(
                                credential.getUsernameEncrypted()))
                .email(
                        credential.getEmailEncrypted() == null
                                ? null
                                : encryptionService.decrypt(
                                credential.getEmailEncrypted()))
                .password(
                        encryptionService.decrypt(
                                credential.getPasswordEncrypted()))
                .notes(
                        credential.getNotesEncrypted() == null
                                ? null
                                : encryptionService.decrypt(
                                credential.getNotesEncrypted()))
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
            RevealCredentialRequest request) {

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

        return mapToDetailResponse(credential);
    }

    @Override
    public CredentialDetailResponse update(
            Long id,
            UpdateCredentialRequest request) {

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
                encryptionService.encrypt(
                        request.getUsername()));

        credential.setEmailEncrypted(
                request.getEmail() == null || request.getEmail().isEmpty()
                        ? null
                        : encryptionService.encrypt(
                        request.getEmail()));

        String newEncryptedPassword =
                encryptionService.encrypt(
                        request.getPassword());

        if (!credential.getPasswordEncrypted()
                .equals(newEncryptedPassword)) {

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
                request.getNotes() == null
                        ? null
                        : encryptionService.encrypt(
                        request.getNotes()));

        credential.setFavorite(request.isFavorite());

        websiteCredentialRepository.save(credential);

        return mapToDetailResponse(credential);
    }

    @Override
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