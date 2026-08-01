package com.bhushan.securecredentialorganizer.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    private String fullName;

    private String email;

    private String loginPassword;

    private String masterPassword;
}