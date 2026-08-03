package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.dto.request.VaultRecoverRequest;
import com.bhushan.securecredentialorganizer.dto.request.VaultUnlockRequest;
import com.bhushan.securecredentialorganizer.dto.request.RegenerateRecoveryKeyRequest;
import com.bhushan.securecredentialorganizer.dto.response.VaultUnlockResponse;
import com.bhushan.securecredentialorganizer.dto.response.RegenerateRecoveryKeyResponse;
import com.bhushan.securecredentialorganizer.dto.response.RegisterResponse;

public interface VaultService {
    VaultUnlockResponse unlock(VaultUnlockRequest request, String email);

    RegisterResponse recover(VaultRecoverRequest request, String email);
            
    RegenerateRecoveryKeyResponse regenerateRecoveryKey(RegenerateRecoveryKeyRequest request, String email);
}
