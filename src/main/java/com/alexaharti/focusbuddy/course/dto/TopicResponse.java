package com.alexaharti.focusbuddy.course.dto;

import com.alexaharti.focusbuddy.ai.document.DocumentProcessingStatus;
import com.alexaharti.focusbuddy.course.entity.TopicStatus;

import java.time.Instant;

public record TopicResponse(
        Long id,
        Long courseId,
        String title,
        String description,
        Integer position,
        TopicStatus status,
        Long documentId,
        String originalFilename,
        Long fileSize,
        DocumentProcessingStatus processingStatus,
        Instant createdAt,
        Instant updatedAt
) {
}
