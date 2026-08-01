package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.dto.request.ForgotPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.ResetPasswordRequest;
import com.bhushan.securecredentialorganizer.dto.request.VerifyOtpRequest;

public interface ForgotPasswordService {

    void sendOtp(ForgotPasswordRequest request);

    void verifyOtp(VerifyOtpRequest request);

    void resetPassword(ResetPasswordRequest request);
}