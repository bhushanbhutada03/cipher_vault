package com.bhushan.securecredentialorganizer.controller;

import com.bhushan.securecredentialorganizer.dto.request.PasswordStrengthRequest;
import com.bhushan.securecredentialorganizer.dto.response.PasswordStrengthResponse;
import com.bhushan.securecredentialorganizer.service.PasswordStrengthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password-strength")
@RequiredArgsConstructor
public class PasswordStrengthController {

    private final PasswordStrengthService passwordStrengthService;

    @PostMapping
    public PasswordStrengthResponse checkStrength(
            @Valid @RequestBody PasswordStrengthRequest request) {

        return passwordStrengthService.checkStrength(request);
    }
}