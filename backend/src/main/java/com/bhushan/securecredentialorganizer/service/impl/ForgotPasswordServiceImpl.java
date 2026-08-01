package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.request.ForgotPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.ResetPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.VerifyOtpRequest;
import com.bhushan.securecredentialorganizer.entity.PasswordResetOtp;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.exception.InvalidOtpException;
import com.bhushan.securecredentialorganizer.exception.OtpExpiredException;
import com.bhushan.securecredentialorganizer.exception.OtpVerificationRequiredException;
import com.bhushan.securecredentialorganizer.repository.PasswordResetOtpRepository;
import com.bhushan.securecredentialorganizer.repository.UserRepository;
import com.bhushan.securecredentialorganizer.service.BruteForceProtectionService;
import com.bhushan.securecredentialorganizer.service.EmailService;
import com.bhushan.securecredentialorganizer.service.ForgotPasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final BruteForceProtectionService attemptService;

    @Override
    public void sendOtp(ForgotPasswordRequest request) {

        String email = request.getEmail();
        attemptService.checkLock(BruteForceProtectionService.Scope.FORGOT_PASSWORD, email);

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            // OWASP Mitigation: Simulate work but do nothing if user doesn't exist to prevent User Enumeration
            attemptService.recordFailedAttempt(BruteForceProtectionService.Scope.FORGOT_PASSWORD, email, 3, 60);
            return;
        }
        
        // Ensure successful request doesn't instantly bypass limits if spammed
        attemptService.recordFailedAttempt(BruteForceProtectionService.Scope.FORGOT_PASSWORD, email, 3, 60);

        User user = userOptional.get();

        passwordResetOtpRepository.deleteByEmail(user.getEmail());

        String otp = generateOtp();

        PasswordResetOtp passwordResetOtp = PasswordResetOtp.builder()
                .email(user.getEmail())
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .build();

        passwordResetOtpRepository.save(passwordResetOtp);

        emailService.sendPasswordResetOtp(user.getEmail(), otp);
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request) {

        String email = request.getEmail();
        attemptService.checkLock(BruteForceProtectionService.Scope.OTP_VERIFICATION, email);

        Optional<PasswordResetOtp> otpOptional = passwordResetOtpRepository
                .findByEmailAndOtp(email, request.getOtp());

        if (otpOptional.isEmpty()) {
            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.OTP_VERIFICATION, email, 5, 900);
            throw new InvalidOtpException("Invalid OTP.", remaining);
        }

        PasswordResetOtp passwordResetOtp = otpOptional.get();

        if (passwordResetOtp.isExpired()) {
            throw new OtpExpiredException("OTP has expired.");
        }

        attemptService.resetAttempts(BruteForceProtectionService.Scope.OTP_VERIFICATION, email);

        passwordResetOtp.setVerified(true);
        passwordResetOtpRepository.save(passwordResetOtp);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetOtp passwordResetOtp =
                passwordResetOtpRepository
                        .findByEmailAndOtp(
                                request.getEmail(),
                                request.getOtp()
                        )
                        .orElseThrow(() ->
                                new InvalidOtpException("Invalid OTP.", 0));

        if (passwordResetOtp.isExpired()) {
            throw new OtpExpiredException("OTP has expired.");
        }

        if (!passwordResetOtp.isVerified()) {
            throw new OtpVerificationRequiredException("OTP verification required.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found."));

        user.setLoginPasswordHash(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);

        passwordResetOtpRepository.delete(passwordResetOtp);
    }

    private String generateOtp() {

        SecureRandom random = new SecureRandom();

        int otp = 100000 + random.nextInt(900000);

        return String.valueOf(otp);
    }
}
