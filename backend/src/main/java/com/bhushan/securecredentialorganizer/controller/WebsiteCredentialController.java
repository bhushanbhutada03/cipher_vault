package com.bhushan.securecredentialorganizer.controller;

import com.bhushan.securecredentialorganizer.dto.request.DeleteCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.request.RevealCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.request.UpdateCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.request.WebsiteCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.response.CredentialDetailResponse;
import com.bhushan.securecredentialorganizer.dto.response.CredentialListResponse;
import com.bhushan.securecredentialorganizer.dto.response.PasswordHistoryResponse;
import com.bhushan.securecredentialorganizer.dto.response.LockStatusResponse;
import com.bhushan.securecredentialorganizer.service.PasswordHistoryService;
import com.bhushan.securecredentialorganizer.service.WebsiteCredentialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/credentials")
@RequiredArgsConstructor
public class WebsiteCredentialController {

    private final WebsiteCredentialService service;
    private final PasswordHistoryService passwordHistoryService;

    @PostMapping
    public void create(
            @Valid @RequestBody WebsiteCredentialRequest request,
            @RequestHeader("X-Vault-Token") String vaultToken) {

        service.create(request, vaultToken);
    }

    @GetMapping
    public List<CredentialListResponse> getAll() {

        return service.getAll();
    }

    @GetMapping("/favorites")
    public List<CredentialListResponse> getFavorites() {

        return service.getFavorites();
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<String> toggleFavorite(
            @PathVariable Long id) {

        service.toggleFavorite(id);

        return ResponseEntity.ok("Favorite status updated.");
    }

    @GetMapping("/search")
    public List<CredentialListResponse> search(
            @RequestParam String keyword) {

        return service.search(keyword);
    }

    @GetMapping("/{id}/history")
    public List<PasswordHistoryResponse> getHistory(
            @PathVariable Long id,
            @RequestHeader("X-Vault-Token") String vaultToken) {

        return passwordHistoryService.getHistory(id, vaultToken);
    }

    @GetMapping("/{id}")
    public CredentialListResponse getById(
            @PathVariable Long id) {

        return service.getById(id);
    }

    @PostMapping("/{id}/reveal")
    public CredentialDetailResponse reveal(
            @PathVariable Long id,
            @Valid @RequestBody RevealCredentialRequest request,
            @RequestHeader("X-Vault-Token") String vaultToken) {

        return service.reveal(id, request, vaultToken);
    }

    @PutMapping("/{id}")
    public CredentialDetailResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCredentialRequest request,
            @RequestHeader("X-Vault-Token") String vaultToken) {

        return service.update(id, request, vaultToken);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id,
            @Valid @RequestBody DeleteCredentialRequest request) {

        service.delete(id, request);
    }

    @GetMapping("/master-password/lock-status")
    public LockStatusResponse getMasterPasswordLockStatus() {
        long remaining = service.getMasterPasswordLockRemainingSeconds();
        return LockStatusResponse.builder()
                .locked(remaining > 0)
                .remainingSeconds(remaining)
                .build();
    }
}