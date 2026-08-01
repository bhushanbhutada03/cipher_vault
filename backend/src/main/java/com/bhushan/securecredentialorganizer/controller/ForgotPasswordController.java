package com.bhushan.securecredentialorganizer.controller;

import com.bhushan.securecredentialorganizer.dto.request.ForgotPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.ResetPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.VerifyOtpRequest;
import com.bhushan.securecredentialorganizer.service.ForgotPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        forgotPasswordService.sendOtp(request);

        return ResponseEntity.ok(
                Map.of("message", "If an account with that email exists, we've sent a password reset OTP.")
        );
    }

    @PostMapping("/forgot-password/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        forgotPasswordService.sendOtp(request);

        return ResponseEntity.ok(
                Map.of("message", "If an account with that email exists, we've sent a new password reset OTP.")
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        forgotPasswordService.verifyOtp(request);

        return ResponseEntity.ok(
                Map.of("message", "OTP verified successfully.")
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        forgotPasswordService.resetPassword(request);

        return ResponseEntity.ok(
                Map.of("message", "Password reset successfully.")
        );
    }
}
