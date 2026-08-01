package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.request.PasswordStrengthRequest;
import com.bhushan.securecredentialorganizer.dto.response.PasswordStrengthResponse;
import com.bhushan.securecredentialorganizer.service.PasswordStrengthService;
import org.springframework.stereotype.Service;

@Service
public class PasswordStrengthServiceImpl implements PasswordStrengthService {

    @Override
    public PasswordStrengthResponse checkStrength(
            PasswordStrengthRequest request) {

        String password = request.getPassword();

        boolean hasUppercase =
                password.matches(".*[A-Z].*");

        boolean hasLowercase =
                password.matches(".*[a-z].*");

        boolean hasNumber =
                password.matches(".*\\d.*");

        boolean hasSymbol =
                password.matches(".*[^A-Za-z0-9].*");

        int score = 0;

        if (hasUppercase) score++;
        if (hasLowercase) score++;
        if (hasNumber) score++;
        if (hasSymbol) score++;

        if (password.length() >= 12) {
            score++;
        }

        String strength;
        String suggestion;

        if (score <= 2) {
            strength = "Weak";
            suggestion =
                    "Use uppercase, lowercase, numbers, symbols and a longer password.";
        }
        else if (score <= 4) {
            strength = "Medium";
            suggestion =
                    "Increase password length and include all character types.";
        }
        else {
            strength = "Strong";
            suggestion =
                    "Your password is strong.";
        }

        return PasswordStrengthResponse.builder()
                .strength(strength)
                .score(score)
                .hasUppercase(hasUppercase)
                .hasLowercase(hasLowercase)
                .hasNumber(hasNumber)
                .hasSymbol(hasSymbol)
                .passwordLength(password.length())
                .suggestion(suggestion)
                .build();
    }
}