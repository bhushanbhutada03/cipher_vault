package com.bhushan.securecredentialorganizer.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CredentialDetailResponse {

    private Long id;

    private String websiteName;

    private String websiteUrl;

    private String username;

    private String email;

    private String password;

    private String notes;

    private String categoryName;

    private boolean favorite;

    private String faviconUrl;
}