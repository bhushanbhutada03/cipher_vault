package com.bhushan.securecredentialorganizer.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterResponse {

    private String message;

    private boolean success;

    private String recoveryKey;
}