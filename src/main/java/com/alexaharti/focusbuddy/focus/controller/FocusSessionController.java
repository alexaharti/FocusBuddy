package com.alexaharti.focusbuddy.focus.controller;

import com.alexaharti.focusbuddy.common.security.CurrentUserService;
import com.alexaharti.focusbuddy.focus.dto.FocusSessionResponse;
import com.alexaharti.focusbuddy.focus.dto.StartFocusSessionRequest;
import com.alexaharti.focusbuddy.focus.service.FocusSessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/focus-sessions")
public class FocusSessionController {

    private final FocusSessionService focusSessionService;
    private final CurrentUserService currentUserService;

    public FocusSessionController(
            FocusSessionService focusSessionService,
            CurrentUserService currentUserService
    ) {
        this.focusSessionService =
                focusSessionService;

        this.currentUserService =
                currentUserService;
    }

    @PostMapping
    public ResponseEntity<FocusSessionResponse>
    startSession(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody
            StartFocusSessionRequest request
    ) {
        Long userId =
                currentUserService.getUserId(jwt);

        FocusSessionResponse response =
                focusSessionService.startSession(
                        userId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<FocusSessionResponse>>
    getSessions(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId =
                currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                focusSessionService.getSessions(
                        userId
                )
        );
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<FocusSessionResponse>
    getSession(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long sessionId
    ) {
        Long userId =
                currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                focusSessionService.getSession(
                        userId,
                        sessionId
                )
        );
    }

    @PostMapping("/{sessionId}/complete")
    public ResponseEntity<FocusSessionResponse>
    completeSession(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long sessionId
    ) {
        Long userId =
                currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                focusSessionService.completeSession(
                        userId,
                        sessionId
                )
        );
    }

    @PostMapping("/{sessionId}/cancel")
    public ResponseEntity<FocusSessionResponse>
    cancelSession(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long sessionId
    ) {
        Long userId =
                currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                focusSessionService.cancelSession(
                        userId,
                        sessionId
                )
        );
    }
}