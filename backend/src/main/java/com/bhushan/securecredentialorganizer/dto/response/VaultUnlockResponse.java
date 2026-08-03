package com.bhushan.securecredentialorganizer.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VaultUnlockResponse {
    private boolean success;
    private String message;
    private String vaultToken;
    private String recoveryKey;
}
