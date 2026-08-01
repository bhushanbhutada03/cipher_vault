package com.bhushan.securecredentialorganizer.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CredentialListResponse {

    private Long id;

    private String websiteName;

    private String websiteUrl;

    private String categoryName;

    private boolean favorite;

    private String faviconUrl;
}