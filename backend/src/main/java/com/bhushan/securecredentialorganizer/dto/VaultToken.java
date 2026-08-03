package com.bhushan.securecredentialorganizer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaultToken {
    private String dek;
    private int tv;
    private long exp;
}
