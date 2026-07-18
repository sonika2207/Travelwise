package com.travelplanner.auth.service.impl;

import com.travelplanner.auth.dto.*;
import com.travelplanner.auth.entity.PasswordResetToken;
import com.travelplanner.auth.entity.User;
import com.travelplanner.auth.repository.PasswordResetTokenRepository;
import com.travelplanner.auth.repository.UserRepository;
import com.travelplanner.auth.service.AuthenticationService;
import com.travelplanner.exception.AuthenticationException;
import com.travelplanner.exception.DuplicateEmailException;
import com.travelplanner.security.JwtService;
import com.travelplanner.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;
import com.travelplanner.exception.ResourceNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Override
    public AuthResponse register(RegisterRequest request) {
        long startTime = System.currentTimeMillis();
        String email = request.getEmail().trim().toLowerCase();
        log.info("Starting user registration for email: {}", email);
        if (userRepository.existsByEmail(email)) {
            log.warn("Registration conflict: Email {} is already registered", email);
            throw new DuplicateEmailException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .homeCity(request.getHomeCity())
                .homeCurrency(request.getHomeCurrency())
                .build();

        userRepository.save(user);
        log.info("Successfully registered user: {}", email);
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);
        
        try {
            emailService.sendWelcomeEmail(user);
            log.info("Welcome email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", email, e.getMessage());
        }

        AuthResponse response = AuthResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .build();
                
        long duration = System.currentTimeMillis() - startTime;
        log.info("User Registration execution time: {} ms", duration);
        return response;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        long startTime = System.currentTimeMillis();
        String email = request.getEmail().trim().toLowerCase();
        log.info("Login attempt for user: {}", email);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.getPassword()
                    )
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.error("Authentication failed for user: {} - Reason: {}", email, e.getMessage());
            throw new AuthenticationException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User details not found in database for authenticated email: {}", email);
                    return new AuthenticationException("Invalid email or password");
                });

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);

        log.info("User {} logged in successfully, token generated", email);

        AuthResponse response = AuthResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .build();
                
        long duration = System.currentTimeMillis() - startTime;
        log.info("Login execution time: {} ms", duration);
        return response;
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with this email does not exist"));

        // Clean up old tokens
        passwordResetTokenRepository.deleteByUser(user);

        // Generate token (expires in 1 hour)
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send email
        String resetLink = "https://travelwise-bifj.onrender.com/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user, resetLink);
        log.info("Password reset token generated and email dispatched to user: {}", email);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired reset token"));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This reset token has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        log.info("Successfully reset password for user: {}", user.getEmail());
    }
}
