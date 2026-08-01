package com.bhushan.securecredentialorganizer.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PasswordHistoryResponse {

    private String oldPassword;

    private LocalDateTime changedAt;
}