package com.alexaharti.focusbuddy.course.dto;

import java.time.Instant;

public record CourseResponse(
        Long id,
        String name,
        String description,
        String color,
        String yearLabel,
        Instant createdAt,
        Instant updatedAt
) {
}