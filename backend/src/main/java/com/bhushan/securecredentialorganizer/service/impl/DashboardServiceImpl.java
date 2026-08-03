package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.response.CredentialListResponse;
import com.bhushan.securecredentialorganizer.dto.response.DashboardResponse;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.entity.WebsiteCredential;
import com.bhushan.securecredentialorganizer.repository.CategoryRepository;
import com.bhushan.securecredentialorganizer.repository.WebsiteCredentialRepository;
import com.bhushan.securecredentialorganizer.security.CustomUserDetails;
import com.bhushan.securecredentialorganizer.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final WebsiteCredentialRepository websiteCredentialRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public DashboardResponse getDashboard() {

        User user = getCurrentUser();

        List<CredentialListResponse> recentCredentials =
                websiteCredentialRepository
                        .findTop5ByUserOrderByCreatedAtDesc(user)
                        .stream()
                        .map(this::mapToCredentialListResponse)
                        .toList();

        return DashboardResponse.builder()
                .totalCredentials(
                        websiteCredentialRepository.countByUser(user))
                .favoriteCredentials(
                        websiteCredentialRepository
                                .countByUserAndFavoriteTrue(user))
                .totalCategories(
                        categoryRepository.countByUser(user))
                .recentCredentials(recentCredentials)
                .build();
    }

    private CredentialListResponse mapToCredentialListResponse(
            WebsiteCredential credential) {

        return CredentialListResponse.builder()
                .id(credential.getId())
                .websiteName(credential.getWebsiteName())
                .websiteUrl(credential.getWebsiteUrl())
                .categoryName(
                        credential.getCategory().getCategoryName())
                .favorite(credential.isFavorite())
                .faviconUrl(credential.getFaviconUrl())
                .build();
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return userDetails.getUser();
    }
}
