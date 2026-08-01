package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.request.PasswordGeneratorRequest;
import com.bhushan.securecredentialorganizer.dto.response.PasswordGeneratorResponse;
import com.bhushan.securecredentialorganizer.exception.InvalidPasswordGenerationRequestException;
import com.bhushan.securecredentialorganizer.service.PasswordGeneratorService;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PasswordGeneratorServiceImpl implements PasswordGeneratorService {

    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String NUMBERS = "0123456789";
    private static final String SYMBOLS = "!@#$%^&*()-_=+[]{}<>?";

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public PasswordGeneratorResponse generatePassword(
            PasswordGeneratorRequest request) {

        validateRequest(request);

        StringBuilder characterPool = new StringBuilder();
        List<Character> passwordCharacters = new ArrayList<>();

        if (request.isUppercase()) {
            characterPool.append(UPPERCASE);
            passwordCharacters.add(randomCharacter(UPPERCASE));
        }

        if (request.isLowercase()) {
            characterPool.append(LOWERCASE);
            passwordCharacters.add(randomCharacter(LOWERCASE));
        }

        if (request.isNumbers()) {
            characterPool.append(NUMBERS);
            passwordCharacters.add(randomCharacter(NUMBERS));
        }

        if (request.isSymbols()) {
            characterPool.append(SYMBOLS);
            passwordCharacters.add(randomCharacter(SYMBOLS));
        }

        while (passwordCharacters.size() < request.getLength()) {
            passwordCharacters.add(
                    randomCharacter(characterPool.toString())
            );
        }

        Collections.shuffle(passwordCharacters, secureRandom);

        StringBuilder generatedPassword = new StringBuilder();

        for (Character character : passwordCharacters) {
            generatedPassword.append(character);
        }

        return PasswordGeneratorResponse.builder()
                .password(generatedPassword.toString())
                .build();
    }

    private char randomCharacter(String source) {

        return source.charAt(
                secureRandom.nextInt(source.length())
        );
    }

    private void validateRequest(
            PasswordGeneratorRequest request) {

        if (!request.isUppercase()
                && !request.isLowercase()
                && !request.isNumbers()
                && !request.isSymbols()) {

            throw new InvalidPasswordGenerationRequestException(
                    "Select at least one character type."
            );
        }
    }
}