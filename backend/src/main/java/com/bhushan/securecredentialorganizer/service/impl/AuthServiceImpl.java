package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.dto.request.LoginRequest;
import com.bhushan.securecredentialorganizer.dto.request.RegisterRequest;
import com.bhushan.securecredentialorganizer.dto.response.LoginResponse;
import com.bhushan.securecredentialorganizer.dto.response.RegisterResponse;
import com.bhushan.securecredentialorganizer.entity.User;
import com.bhushan.securecredentialorganizer.repository.UserRepository;
import com.bhushan.securecredentialorganizer.service.AuthService;
import com.bhushan.securecredentialorganizer.service.jwt.JwtService;
import com.bhushan.securecredentialorganizer.exception.BruteForceLockedException;
import com.bhushan.securecredentialorganizer.exception.InvalidCredentialsException;
import com.bhushan.securecredentialorganizer.service.BruteForceProtectionService;
import lombok.RequiredArgsConstructor;
import com.bhushan.securecredentialorganizer.encryption.EncryptionService;
import com.bhushan.securecredentialorganizer.encryption.KeyDerivationService;
import com.bhushan.securecredentialorganizer.encryption.RecoveryKeyService;

import java.security.SecureRandom;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.bhushan.securecredentialorganizer.repository.RegistrationOtpRepository;
import com.bhushan.securecredentialorganizer.service.EmailService;
import com.bhushan.securecredentialorganizer.service.OtpService;
import com.bhushan.securecredentialorganizer.entity.RegistrationOtp;
import com.bhushan.securecredentialorganizer.exception.EmailNotVerifiedException;
import com.bhushan.securecredentialorganizer.dto.request.VerifyOtpRequest;
import com.bhushan.securecredentialorganizer.exception.InvalidOtpException;
import com.bhushan.securecredentialorganizer.exception.OtpExpiredException;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final BruteForceProtectionService attemptService;
    
    private final KeyDerivationService kdfService;
    private final EncryptionService encryptionService;
    private final RecoveryKeyService recoveryKeyService;
    
    private final RegistrationOtpRepository registrationOtpRepository;
    private final EmailService emailService;
    private final OtpService otpService;
    
    private final SecureRandom secureRandom = new SecureRandom();
    private String dummyHash;

    @jakarta.annotation.PostConstruct
    public void init() {
        this.dummyHash = passwordEncoder.encode("dummy");
    }

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        if (request.getLoginPassword().equals(request.getMasterPassword())) {
            return RegisterResponse.builder()
                    .success(false)
                    .message("Master Password must be different from Login Password.")
                    .build();
        }

        String normalizedEmail = normalizeEmail(request.getEmail());
        request.setEmail(normalizedEmail);

        if (userRepository.existsByEmail(request.getEmail())) {
            return RegisterResponse.builder()
                    .success(false)
                    .message("Email already registered.")
                    .build();
        }
        
        byte[] salt = kdfService.generateSalt();
        char[] mpChars = request.getMasterPassword().toCharArray();
        byte[] masterKek = null;
        byte[] dek = null;
        char[] recoveryKeyChars = null;
        byte[] recoveryKek = null;
        
        try {
            masterKek = kdfService.deriveKey(mpChars, salt);
            
            dek = new byte[32];
            secureRandom.nextBytes(dek);
            
            String encryptedDekMaster = Base64.getEncoder().encodeToString(encryptionService.encryptGcm(dek, masterKek, null));
            
            String recoveryKey = recoveryKeyService.generateRecoveryKey();
            recoveryKeyChars = recoveryKey.toCharArray();
            recoveryKek = kdfService.deriveKey(recoveryKeyChars, salt);
            
            String encryptedDekRecovery = Base64.getEncoder().encodeToString(encryptionService.encryptGcm(dek, recoveryKek, null));
            
            User user = User.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .loginPasswordHash(passwordEncoder.encode(request.getLoginPassword()))
                    .masterPasswordHash(passwordEncoder.encode(request.getMasterPassword()))
                    .emailVerified(false)
                    .kdfSalt(salt)
                    .encryptedDekMaster(encryptedDekMaster)
                    .encryptedDekRecovery(encryptedDekRecovery)
                    .tokenVersion(0)
                    .build();

            user = userRepository.save(user);

            String otp = otpService.generateOtp();
            RegistrationOtp registrationOtp = RegistrationOtp.builder()
                    .user(user)
                    .otp(otp)
                    .expiryTime(otpService.getExpiryTime())
                    .build();
            registrationOtpRepository.save(registrationOtp);
            emailService.sendRegistrationOtp(user.getEmail(), otp);

            return RegisterResponse.builder()
                    .success(true)
                    .message("User registered successfully.")
                    .recoveryKey(recoveryKey)
                    .build();
        } finally {
            if (mpChars != null) Arrays.fill(mpChars, '\0');
            if (masterKek != null) Arrays.fill(masterKek, (byte) 0);
            if (dek != null) Arrays.fill(dek, (byte) 0);
            if (recoveryKeyChars != null) Arrays.fill(recoveryKeyChars, '\0');
            if (recoveryKek != null) Arrays.fill(recoveryKek, (byte) 0);
        }
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        request.setEmail(normalizedEmail);
        String identifier = request.getEmail();

        attemptService.checkLock(BruteForceProtectionService.Scope.LOGIN, identifier);

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            passwordEncoder.matches(request.getLoginPassword(), dummyHash);
            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.LOGIN, 
                    identifier, 
                    5, 
                    60
            );
            throw new InvalidCredentialsException("Invalid email or password.", remaining);
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.getLoginPassword(),
                user.getLoginPasswordHash()
        );

        if (!passwordMatches) {
            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.LOGIN, 
                    identifier, 
                    5, 
                    60
            );
            throw new InvalidCredentialsException("Invalid email or password.", remaining);
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Please verify your email before logging in.");
        }

        attemptService.resetAttempts(BruteForceProtectionService.Scope.LOGIN, identifier);

        String token = jwtService.generateToken(user.getEmail());

        return LoginResponse.builder()
                .success(true)
                .message("Login successful.")
                .token(token)
                .build();
    }

    private String normalizeEmail(String email) {
        if (email == null) return null;
        email = email.trim().toLowerCase();
        String[] parts = email.split("@");
        if (parts.length == 2 && parts[1].equals("gmail.com")) {
            String localPart = parts[0].replace(".", "");
            int plusIndex = localPart.indexOf('+');
            if (plusIndex > 0) {
                localPart = localPart.substring(0, plusIndex);
            }
            return localPart + "@" + parts[1];
        }
        return email;
    }

    @Override
    @Transactional
    public void verifyEmail(VerifyOtpRequest request) {
        String email = normalizeEmail(request.getEmail());
        attemptService.checkLock(BruteForceProtectionService.Scope.OTP_VERIFICATION, email);

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.OTP_VERIFICATION, email, 5, 900);
            throw new InvalidOtpException("Invalid OTP.", remaining);
        }

        RegistrationOtp registrationOtp = registrationOtpRepository.findByUserAndOtp(user, request.getOtp())
                .orElse(null);

        if (registrationOtp == null) {
            int remaining = attemptService.recordFailedAttempt(
                    BruteForceProtectionService.Scope.OTP_VERIFICATION, email, 5, 900);
            throw new InvalidOtpException("Invalid OTP.", remaining);
        }

        if (registrationOtp.isExpired()) {
            throw new OtpExpiredException("OTP has expired.");
        }

        attemptService.resetAttempts(BruteForceProtectionService.Scope.OTP_VERIFICATION, email);

        user.setEmailVerified(true);
        userRepository.save(user);

        registrationOtpRepository.delete(registrationOtp);
    }

    @Override
    @Transactional
    public void resendVerificationOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        attemptService.checkLock(BruteForceProtectionService.Scope.FORGOT_PASSWORD, normalizedEmail);

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            attemptService.recordFailedAttempt(BruteForceProtectionService.Scope.FORGOT_PASSWORD, normalizedEmail, 3, 60);
            return;
        }
        
        attemptService.recordFailedAttempt(BruteForceProtectionService.Scope.FORGOT_PASSWORD, normalizedEmail, 3, 60);

        if (user.isEmailVerified()) {
            throw new IllegalStateException("Email is already verified.");
        }

        RegistrationOtp registrationOtp = registrationOtpRepository.findByUser(user).orElse(null);
        String otp = otpService.generateOtp();

        if (registrationOtp != null) {
            registrationOtp.setOtp(otp);
            registrationOtp.setExpiryTime(otpService.getExpiryTime());
            registrationOtp.setCreatedAt(java.time.LocalDateTime.now());
            registrationOtp.setVerified(false);
            registrationOtpRepository.save(registrationOtp);
        } else {
            registrationOtp = RegistrationOtp.builder()
                    .user(user)
                    .otp(otp)
                    .expiryTime(otpService.getExpiryTime())
                    .build();
            registrationOtpRepository.save(registrationOtp);
        }

        emailService.sendRegistrationOtp(user.getEmail(), otp);
    }
}