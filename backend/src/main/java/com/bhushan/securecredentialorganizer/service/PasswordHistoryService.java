package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.dto.response.PasswordHistoryResponse;

import java.util.List;

public interface PasswordHistoryService {

    List<PasswordHistoryResponse> getHistory(Long credentialId);

}