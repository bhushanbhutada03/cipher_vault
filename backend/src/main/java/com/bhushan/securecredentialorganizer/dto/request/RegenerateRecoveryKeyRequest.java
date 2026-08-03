package com.bhushan.securecredentialorganizer.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegenerateRecoveryKeyRequest {

    @NotBlank(message = "Master password is required")
    private String masterPassword;

}
