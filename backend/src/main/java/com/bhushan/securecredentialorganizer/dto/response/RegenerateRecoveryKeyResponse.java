package com.bhushan.securecredentialorganizer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegenerateRecoveryKeyResponse {

    private boolean success;
    private String message;
    private String recoveryKey;

}
