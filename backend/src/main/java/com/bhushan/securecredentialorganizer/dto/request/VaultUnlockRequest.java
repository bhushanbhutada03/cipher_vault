package com.bhushan.securecredentialorganizer.dto.request;

import lombok.Data;

@Data
public class VaultUnlockRequest {
    private String masterPassword;
}
