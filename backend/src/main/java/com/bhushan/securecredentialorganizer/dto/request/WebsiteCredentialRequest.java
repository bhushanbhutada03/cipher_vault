package com.bhushan.securecredentialorganizer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WebsiteCredentialRequest {

    @NotNull
    private Long categoryId;

    @NotBlank
    private String websiteName;

    private String websiteUrl;

    @NotBlank
    private String username;

    private String email;

    @NotBlank
    private String password;

    private String notes;

    private boolean favorite;
}