package com.bhushan.securecredentialorganizer.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordGeneratorRequest {

    @Min(value = 8, message = "Minimum length is 8.")
    @Max(value = 64, message = "Maximum length is 64.")
    private int length;

    private boolean uppercase;

    private boolean lowercase;

    private boolean numbers;

    private boolean symbols;
}