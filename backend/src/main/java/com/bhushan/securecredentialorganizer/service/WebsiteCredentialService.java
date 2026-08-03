package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.dto.request.DeleteCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.request.RevealCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.request.UpdateCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.request.WebsiteCredentialRequest;
import com.bhushan.securecredentialorganizer.dto.response.CredentialDetailResponse;
import com.bhushan.securecredentialorganizer.dto.response.CredentialListResponse;

import java.util.List;

public interface WebsiteCredentialService {

    void create(WebsiteCredentialRequest request, String vaultToken);

    List<CredentialListResponse> getAll();

    CredentialListResponse getById(Long id);

    CredentialDetailResponse reveal(
            Long id,
            RevealCredentialRequest request,
            String vaultToken
    );

    CredentialDetailResponse update(
            Long id,
            UpdateCredentialRequest request,
            String vaultToken
    );

    void delete(
            Long id,
            DeleteCredentialRequest request
    );

    long getMasterPasswordLockRemainingSeconds();

    List<CredentialListResponse> getFavorites();

    void toggleFavorite(Long id);

    List<CredentialListResponse> search(String keyword);
}