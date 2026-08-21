package com.alexaharti.focusbuddy.course.controller;

import com.alexaharti.focusbuddy.common.security.CurrentUserService;
import com.alexaharti.focusbuddy.course.dto.CourseResponse;
import com.alexaharti.focusbuddy.course.dto.CreateCourseRequest;
import com.alexaharti.focusbuddy.course.dto.UpdateCourseRequest;
import com.alexaharti.focusbuddy.course.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;
    private final CurrentUserService currentUserService;

    public CourseController(
            CourseService courseService,
            CurrentUserService currentUserService
    ) {
        this.courseService = courseService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateCourseRequest request
    ) {
        Long userId = currentUserService.getUserId(jwt);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(courseService.createCourse(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getCourses(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                courseService.getCourses(userId)
        );
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponse> getCourse(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId
    ) {
        Long userId = currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                courseService.getCourse(userId, courseId)
        );
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponse> updateCourse(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId,
            @Valid @RequestBody UpdateCourseRequest request
    ) {
        Long userId = currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                courseService.updateCourse(
                        userId,
                        courseId,
                        request
                )
        );
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId
    ) {
        Long userId = currentUserService.getUserId(jwt);

        courseService.deleteCourse(userId, courseId);

        return ResponseEntity.noContent().build();
    }
}