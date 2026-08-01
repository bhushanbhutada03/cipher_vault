package com.bhushan.securecredentialorganizer.dto.request;

import lombok.Data;

@Data
public class LoginRequest {

    private String email;
    private String loginPassword;

}