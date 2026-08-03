package com.bhushan.securecredentialorganizer.controller;

import com.bhushan.securecredentialorganizer.dto.request.VaultUnlockRequest;
import com.bhushan.securecredentialorganizer.dto.response.VaultUnlockResponse;
import com.bhushan.securecredentialorganizer.service.VaultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vault")
@RequiredArgsConstructor
public class VaultController {

    private final VaultService vaultService;

    @PostMapping("/unlock")
    public ResponseEntity<VaultUnlockResponse> unlock(
            @Valid @RequestBody VaultUnlockRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(vaultService.unlock(request, authentication.getName()));
    }

    @PostMapping("/recover")
    public ResponseEntity<com.bhushan.securecredentialorganizer.dto.response.RegisterResponse> recover(
            @Valid @RequestBody com.bhushan.securecredentialorganizer.dto.request.VaultRecoverRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(vaultService.recover(request, authentication.getName()));
    }

    @PostMapping("/recovery-key/regenerate")
    public ResponseEntity<com.bhushan.securecredentialorganizer.dto.response.RegenerateRecoveryKeyResponse> regenerateRecoveryKey(
            @Valid @RequestBody com.bhushan.securecredentialorganizer.dto.request.RegenerateRecoveryKeyRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(vaultService.regenerateRecoveryKey(request, authentication.getName()));
    }
}
