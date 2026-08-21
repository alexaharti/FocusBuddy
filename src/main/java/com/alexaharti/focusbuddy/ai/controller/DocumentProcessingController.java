package com.alexaharti.focusbuddy.ai.controller;

import com.alexaharti.focusbuddy.ai.document.DocumentProcessingResponse;
import com.alexaharti.focusbuddy.ai.document.DocumentProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
        "/api/users/{ownerId}/courses/{courseId}/topics/{topicId}/document"
)
public class DocumentProcessingController {

    private final DocumentProcessingService documentProcessingService;

    public DocumentProcessingController(
            DocumentProcessingService documentProcessingService
    ) {
        this.documentProcessingService =
                documentProcessingService;
    }

    @PostMapping("/process")
    public ResponseEntity<DocumentProcessingResponse> processDocument(
            @PathVariable Long ownerId,
            @PathVariable Long courseId,
            @PathVariable Long topicId
    ) {
        return ResponseEntity.ok(
                documentProcessingService.processDocument(
                        ownerId,
                        courseId,
                        topicId
                )
        );
    }
}