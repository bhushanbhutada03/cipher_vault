package com.bhushan.securecredentialorganizer.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RevealCredentialRequest {

    @NotBlank(message = "Master password is required")
    private String masterPassword;
}