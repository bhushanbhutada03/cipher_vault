package com.bhushan.securecredentialorganizer.controller;

import com.bhushan.securecredentialorganizer.dto.request.LoginRequest;
import com.bhushan.securecredentialorganizer.dto.request.RegisterRequest;
import com.bhushan.securecredentialorganizer.dto.response.LoginResponse;
import com.bhushan.securecredentialorganizer.dto.response.RegisterResponse;
import com.bhushan.securecredentialorganizer.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}