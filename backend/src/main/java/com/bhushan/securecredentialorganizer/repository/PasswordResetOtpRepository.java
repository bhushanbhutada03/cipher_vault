package com.bhushan.securecredentialorganizer.repository;

import com.bhushan.securecredentialorganizer.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetOtpRepository
        extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findTopByEmailOrderByCreatedAtDesc(
            String email
    );

    Optional<PasswordResetOtp> findByEmailAndOtp(
            String email,
            String otp
    );

    void deleteByEmail(String email);
}