package com.bhushan.securecredentialorganizer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeMasterPasswordRequest {

    @NotBlank(message = "Current master password is required.")
    private String currentMasterPassword;

    @NotBlank(message = "New master password is required.")
    @Size(min = 8, message = "Master password must be at least 8 characters.")
    private String newMasterPassword;

}