package com.alexaharti.focusbuddy.course.controller;

import com.alexaharti.focusbuddy.course.dto.TopicResponse;
import com.alexaharti.focusbuddy.course.service.TopicService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
@RequestMapping(
        "/api/users/{ownerId}/courses/{courseId}/topics"
)
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TopicResponse> createTopic(
            @PathVariable Long ownerId,
            @PathVariable Long courseId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestPart("file") MultipartFile file
    ) {
        TopicResponse response = topicService.createTopicFromPdf(
                ownerId,
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
            @PathVariable Long ownerId,
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(
                topicService.getTopics(ownerId, courseId)
        );
    }

    @GetMapping("/{topicId}")
    public ResponseEntity<TopicResponse> getTopic(
            @PathVariable Long ownerId,
            @PathVariable Long courseId,
            @PathVariable Long topicId
    ) {
        return ResponseEntity.ok(
                topicService.getTopic(ownerId, courseId, topicId)
        );
    }
}