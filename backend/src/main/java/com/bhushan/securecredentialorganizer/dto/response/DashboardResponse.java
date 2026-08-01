package com.bhushan.securecredentialorganizer.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardResponse {

    private long totalCredentials;

    private long favoriteCredentials;

    private long totalCategories;

    private List<CredentialListResponse> recentCredentials;
}