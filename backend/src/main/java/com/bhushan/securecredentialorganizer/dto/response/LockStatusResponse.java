package com.bhushan.securecredentialorganizer.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LockStatusResponse {
    private boolean locked;
    private long remainingSeconds;
}
