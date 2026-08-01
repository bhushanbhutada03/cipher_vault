package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendPasswordResetOtp(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(
                "Password Reset OTP - Secure Credential Organizer"
        );
        message.setText(
                "Your OTP is: " + otp + "\n\n"
                        + "Valid for 10 minutes.\n\n"
                        + "If you did not request this, please ignore this email."
        );

        mailSender.send(message);
    }
}
