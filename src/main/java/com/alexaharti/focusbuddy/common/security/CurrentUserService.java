package com.alexaharti.focusbuddy.common.security;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    public Long getUserId(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            throw new IllegalStateException(
                    "Authenticated user information is missing"
            );
        }

        try {
            return Long.valueOf(jwt.getSubject());
        } catch (NumberFormatException exception) {
            throw new IllegalStateException(
                    "JWT subject does not contain a valid user ID",
                    exception
            );
        }
    }
}