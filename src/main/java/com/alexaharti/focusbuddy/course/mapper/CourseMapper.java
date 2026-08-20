package com.alexaharti.focusbuddy.course.mapper;

import com.alexaharti.focusbuddy.course.dto.CourseResponse;
import com.alexaharti.focusbuddy.course.entity.Course;

public final class CourseMapper {

    private CourseMapper() {
    }

    public static CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getName(),
                course.getDescription(),
                course.getColor(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }
}