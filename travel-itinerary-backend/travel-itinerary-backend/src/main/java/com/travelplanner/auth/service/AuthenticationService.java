package com.travelplanner.auth.service;

import com.travelplanner.auth.dto.AuthResponse;
import com.travelplanner.auth.dto.LoginRequest;
import com.travelplanner.auth.dto.RegisterRequest;

public interface AuthenticationService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
