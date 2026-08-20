package com.alexaharti.focusbuddy.course.controller;

import com.alexaharti.focusbuddy.course.dto.CourseResponse;
import com.alexaharti.focusbuddy.course.dto.CreateCourseRequest;
import com.alexaharti.focusbuddy.course.dto.UpdateCourseRequest;
import com.alexaharti.focusbuddy.course.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users/{ownerId}/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(
            @PathVariable Long ownerId,
            @Valid @RequestBody CreateCourseRequest request
    ) {
        CourseResponse response =
                courseService.createCourse(ownerId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getCourses(
            @PathVariable Long ownerId
    ) {
        return ResponseEntity.ok(
                courseService.getCourses(ownerId)
        );
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponse> getCourse(
            @PathVariable Long ownerId,
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(
                courseService.getCourse(ownerId, courseId)
        );
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long ownerId,
            @PathVariable Long courseId,
            @Valid @RequestBody UpdateCourseRequest request
    ) {
        return ResponseEntity.ok(
                courseService.updateCourse(ownerId, courseId, request)
        );
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable Long ownerId,
            @PathVariable Long courseId
    ) {
        courseService.deleteCourse(ownerId, courseId);
        return ResponseEntity.noContent().build();
    }
}