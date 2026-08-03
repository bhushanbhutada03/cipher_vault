package com.bhushan.securecredentialorganizer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VaultRecoverRequest {

    @NotBlank(message = "Recovery key is required.")
    private String recoveryKey;

    @NotBlank(message = "New master password is required.")
    @Size(min = 8, message = "Master password must be at least 8 characters.")
    private String newMasterPassword;
}
