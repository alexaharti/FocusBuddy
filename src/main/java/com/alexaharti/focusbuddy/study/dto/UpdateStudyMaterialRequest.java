package com.alexaharti.focusbuddy.study.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateStudyMaterialRequest(
        @NotBlank(message = "Content is required")
        String content
) {
}