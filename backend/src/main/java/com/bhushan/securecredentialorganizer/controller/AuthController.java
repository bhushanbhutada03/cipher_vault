package com.bhushan.securecredentialorganizer.controller;

import com.bhushan.securecredentialorganizer.dto.request.LoginRequest;
import com.bhushan.securecredentialorganizer.dto.request.RegisterRequest;
import com.bhushan.securecredentialorganizer.dto.request.VerifyOtpRequest;
import com.bhushan.securecredentialorganizer.dto.response.LoginResponse;
import com.bhushan.securecredentialorganizer.dto.response.RegisterResponse;
import com.bhushan.securecredentialorganizer.service.AuthService;
import com.bhushan.securecredentialorganizer.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(
                Map.of("message", "Email verified successfully.")
        );
    }

    @PostMapping("/register/resend-otp")
    public ResponseEntity<Map<String, String>> resendVerificationOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        authService.resendVerificationOtp(email);
        return ResponseEntity.ok(
                Map.of("message", "If the account exists and is unverified, a new OTP has been sent.")
        );
    }
}