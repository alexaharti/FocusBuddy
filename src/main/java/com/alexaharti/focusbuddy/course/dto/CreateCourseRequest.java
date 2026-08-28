package com.alexaharti.focusbuddy.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCourseRequest(

        @NotBlank(message = "Course name is required")
        @Size(max = 150, message = "Course name cannot exceed 150 characters")
        String name,

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        String description,

        @Size(max = 20, message = "Color cannot exceed 20 characters")
        String color,

        @Size(max = 100, message = "Year cannot exceed 100 characters")
        String yearLabel
) {
}