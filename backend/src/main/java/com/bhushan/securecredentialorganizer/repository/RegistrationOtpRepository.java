package com.bhushan.securecredentialorganizer.repository;

import com.bhushan.securecredentialorganizer.entity.RegistrationOtp;
import com.bhushan.securecredentialorganizer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistrationOtpRepository extends JpaRepository<RegistrationOtp, Long> {
    Optional<RegistrationOtp> findByUserAndOtp(User user, String otp);
    Optional<RegistrationOtp> findByUser(User user);
    void deleteByUser(User user);
}
