package com.alexaharti.focusbuddy.study.dto;

import com.alexaharti.focusbuddy.study.entity.StudyMaterialType;

import java.time.Instant;

public record StudyMaterialResponse(
        Long id,
        Long topicId,
        StudyMaterialType materialType,
        String content,
        Instant createdAt,
        Instant updatedAt
) {
}