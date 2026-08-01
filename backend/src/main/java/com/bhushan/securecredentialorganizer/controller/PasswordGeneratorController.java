package com.bhushan.securecredentialorganizer.controller;

import com.bhushan.securecredentialorganizer.dto.request.PasswordGeneratorRequest;
import com.bhushan.securecredentialorganizer.dto.response.PasswordGeneratorResponse;
import com.bhushan.securecredentialorganizer.service.PasswordGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password-generator")
@RequiredArgsConstructor
public class PasswordGeneratorController {

    private final PasswordGeneratorService passwordGeneratorService;

    @PostMapping
    public PasswordGeneratorResponse generatePassword(
            @Valid @RequestBody PasswordGeneratorRequest request) {

        return passwordGeneratorService.generatePassword(request);
    }
}