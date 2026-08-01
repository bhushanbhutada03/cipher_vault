package com.bhushan.securecredentialorganizer.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteCredentialRequest {

    @NotBlank
    private String masterPassword;
}