package com.alexaharti.focusbuddy.auth.dto;

import java.time.Instant;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        UserResponse user
) {

    public record UserResponse(
            Long id,
            String email,
            String displayName
    ) {
    }
}