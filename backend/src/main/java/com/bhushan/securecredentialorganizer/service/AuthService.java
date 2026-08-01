package com.bhushan.securecredentialorganizer.service;

import com.bhushan.securecredentialorganizer.dto.request.LoginRequest;
import com.bhushan.securecredentialorganizer.dto.request.RegisterRequest;
import com.bhushan.securecredentialorganizer.dto.response.LoginResponse;
import com.bhushan.securecredentialorganizer.dto.response.RegisterResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

}