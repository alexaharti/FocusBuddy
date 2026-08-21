package com.alexaharti.focusbuddy.auth.service;

import com.alexaharti.focusbuddy.auth.dto.AuthResponse;
import com.alexaharti.focusbuddy.auth.dto.LoginRequest;
import com.alexaharti.focusbuddy.auth.dto.RegisterRequest;
import com.alexaharti.focusbuddy.common.exception.ResourceAlreadyExistsException;
import com.alexaharti.focusbuddy.user.entity.AppUser;
import com.alexaharti.focusbuddy.user.repository.AppUserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (appUserRepository.existsByEmail(email)) {
            throw new ResourceAlreadyExistsException(
                    "An account with this email already exists"
            );
        }

        AppUser user = new AppUser();
        user.setDisplayName(request.displayName().trim());
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        AppUser savedUser = appUserRepository.save(user);

        return createResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        AppUser user = appUserRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw new BadCredentialsException(
                    "Invalid email or password"
            );
        }

        return createResponse(user);
    }

    private AuthResponse createResponse(AppUser user) {
        JwtService.GeneratedToken token =
                jwtService.generateToken(user);

        return new AuthResponse(
                token.value(),
                "Bearer",
                token.expiresAt(),
                new AuthResponse.UserResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getDisplayName()
                )
        );
    }

    private String normalizeEmail(String email) {
        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}