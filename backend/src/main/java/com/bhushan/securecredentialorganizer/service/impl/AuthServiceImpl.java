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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final BruteForceProtectionService attemptService;

    @Override
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return RegisterResponse.builder()
                    .success(false)
                    .message("Email already registered.")
                    .build();
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .loginPasswordHash(passwordEncoder.encode(request.getLoginPassword()))
                .masterPasswordHash(passwordEncoder.encode(request.getMasterPassword()))
                .emailVerified(false)
                .build();

        userRepository.save(user);

        return RegisterResponse.builder()
                .success(true)
                .message("User registered successfully.")
                .build();
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String identifier = request.getEmail();

        attemptService.checkLock(BruteForceProtectionService.Scope.LOGIN, identifier);

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
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

        attemptService.resetAttempts(BruteForceProtectionService.Scope.LOGIN, identifier);

        String token = jwtService.generateToken(user.getEmail());

        return LoginResponse.builder()
                .success(true)
                .message("Login successful.")
                .token(token)
                .build();
    }
}