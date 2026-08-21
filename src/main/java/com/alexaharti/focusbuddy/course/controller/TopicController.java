package com.alexaharti.focusbuddy.course.controller;

import com.alexaharti.focusbuddy.common.security.CurrentUserService;
import com.alexaharti.focusbuddy.course.dto.TopicResponse;
import com.alexaharti.focusbuddy.course.service.TopicService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/topics")
public class TopicController {

    private final TopicService topicService;
    private final CurrentUserService currentUserService;

    public TopicController(
            TopicService topicService,
            CurrentUserService currentUserService
    ) {
        this.topicService = topicService;
        this.currentUserService = currentUserService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TopicResponse> createTopic(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestPart("file") MultipartFile file
    ) {
        Long userId = currentUserService.getUserId(jwt);

        TopicResponse response = topicService.createTopicFromPdf(
                userId,
                courseId,
                title,
                description,
                file
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
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