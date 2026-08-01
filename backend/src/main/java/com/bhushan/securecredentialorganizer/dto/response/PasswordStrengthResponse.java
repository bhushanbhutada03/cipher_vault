package com.bhushan.securecredentialorganizer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordStrengthResponse {

    private String strength;

    private int score;

    private boolean hasUppercase;

    private boolean hasLowercase;

    private boolean hasNumber;

    private boolean hasSymbol;

    private int passwordLength;

    private String suggestion;

}