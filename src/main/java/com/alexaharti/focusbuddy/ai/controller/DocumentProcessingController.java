package com.alexaharti.focusbuddy.ai.controller;

import com.alexaharti.focusbuddy.ai.document.DocumentProcessingResponse;
import com.alexaharti.focusbuddy.ai.document.DocumentProcessingService;
import com.alexaharti.focusbuddy.common.security.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
        "/api/courses/{courseId}/topics/{topicId}/document"
)
public class DocumentProcessingController {

    private final DocumentProcessingService documentProcessingService;
    private final CurrentUserService currentUserService;

    public DocumentProcessingController(
            DocumentProcessingService documentProcessingService,
            CurrentUserService currentUserService
    ) {
        this.documentProcessingService =
                documentProcessingService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/process")
    public ResponseEntity<DocumentProcessingResponse> processDocument(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId,
            @PathVariable Long topicId
    ) {
        Long userId = currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                documentProcessingService.processDocument(
                        userId,
                        courseId,
                        topicId
                )
        );
    }
}