package com.bhushan.securecredentialorganizer.service.impl;

import com.bhushan.securecredentialorganizer.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendPasswordResetOtp(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(fromEmail, "Cipher Vault");
            helper.setTo(to);
            helper.setSubject("Password Reset OTP - Cipher Vault");
            helper.setText("Your OTP is: " + otp + "\n\n"
                    + "Valid for 10 minutes.\n\n"
                    + "If you did not request this, please ignore this email.");

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendRegistrationOtp(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(fromEmail, "Cipher Vault");
            helper.setTo(to);
            helper.setSubject("Verify Your Email - Cipher Vault");
            helper.setText("Welcome to Cipher Vault!\n\n"
                    + "Your email verification OTP is: " + otp + "\n\n"
                    + "Valid for 10 minutes.\n\n"
                    + "If you did not register for an account, please ignore this email.");

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
