package com.alexaharti.focusbuddy.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTopicRequest(

        @NotBlank(message = "Topic title is required")
        @Size(max = 200, message = "Topic title cannot exceed 200 characters")
        String title,

        String description
) {
}