package com.alexaharti.focusbuddy.course.controller;

import com.alexaharti.focusbuddy.ai.document.DocumentProcessingResponse;
import com.alexaharti.focusbuddy.ai.document.DocumentProcessingService;
import com.alexaharti.focusbuddy.common.security.CurrentUserService;
import com.alexaharti.focusbuddy.course.dto.CreateTopicRequest;
import com.alexaharti.focusbuddy.course.dto.TopicResponse;
import com.alexaharti.focusbuddy.course.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/topics")
public class TopicController {

    private final TopicService topicService;
    private final CurrentUserService currentUserService;
    private final DocumentProcessingService documentProcessingService;

    public TopicController(
            TopicService topicService,
            CurrentUserService currentUserService,
            DocumentProcessingService documentProcessingService
    ) {
        this.topicService = topicService;
        this.currentUserService = currentUserService;
        this.documentProcessingService = documentProcessingService;
    }

    @PostMapping
    public ResponseEntity<TopicResponse> createTopic(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId,
            @Valid @RequestBody CreateTopicRequest request
    ) {
        Long userId = currentUserService.getUserId(jwt);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        topicService.createTopic(
                                userId,
                                courseId,
                                request
                        )
                );
    }

    @PostMapping(
            value = "/{topicId}/lecture",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<TopicResponse> uploadLecture(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId,
            @PathVariable Long topicId,
            @RequestPart("file") MultipartFile file
    ) {
        Long userId = currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                topicService.uploadLecture(
                        userId,
                        courseId,
                        topicId,
                        file
                )
        );
    }

    @PostMapping("/{topicId}/lecture/process")
    public ResponseEntity<DocumentProcessingResponse> processLecture(
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

    @GetMapping
    public ResponseEntity<List<TopicResponse>> getTopics(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId
    ) {
        Long userId = currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                topicService.getTopics(userId, courseId)
        );
    }

    @GetMapping("/{topicId}")
    public ResponseEntity<TopicResponse> getTopic(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId,
            @PathVariable Long topicId
    ) {
        Long userId = currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                topicService.getTopic(
                        userId,
                        courseId,
                        topicId
                )
        );
    }
}