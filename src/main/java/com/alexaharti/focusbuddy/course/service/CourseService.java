package com.alexaharti.focusbuddy.course.service;

import com.alexaharti.focusbuddy.common.exception.ResourceNotFoundException;
import com.alexaharti.focusbuddy.course.dto.CourseResponse;
import com.alexaharti.focusbuddy.course.dto.CreateCourseRequest;
import com.alexaharti.focusbuddy.course.dto.UpdateCourseRequest;
import com.alexaharti.focusbuddy.course.entity.Course;
import com.alexaharti.focusbuddy.course.mapper.CourseMapper;
import com.alexaharti.focusbuddy.course.repository.CourseRepository;
import com.alexaharti.focusbuddy.user.entity.AppUser;
import com.alexaharti.focusbuddy.user.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final AppUserRepository appUserRepository;

    public CourseService(
            CourseRepository courseRepository,
            AppUserRepository appUserRepository
    ) {
        this.courseRepository = courseRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public CourseResponse createCourse(
            Long ownerId,
            CreateCourseRequest request
    ) {
        AppUser owner = findUser(ownerId);

        Course course = new Course();
        course.setName(request.name().trim());
        course.setDescription(normalizeOptionalText(request.description()));
        course.setColor(normalizeOptionalText(request.color()));

        owner.addCourse(course);

        Course savedCourse = courseRepository.save(course);

        return CourseMapper.toResponse(savedCourse);
    }

    public List<CourseResponse> getCourses(Long ownerId) {
        findUser(ownerId);

        return courseRepository
                .findAllByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(CourseMapper::toResponse)
                .toList();
    }

    public CourseResponse getCourse(Long ownerId, Long courseId) {
        Course course = findOwnedCourse(ownerId, courseId);
        return CourseMapper.toResponse(course);
    }

    @Transactional
    public CourseResponse updateCourse(
            Long ownerId,
            Long courseId,
            UpdateCourseRequest request
    ) {
        Course course = findOwnedCourse(ownerId, courseId);

        course.setName(request.name().trim());
        course.setDescription(normalizeOptionalText(request.description()));
        course.setColor(normalizeOptionalText(request.color()));

        Course savedCourse = courseRepository.save(course);

        return CourseMapper.toResponse(savedCourse);
    }

    @Transactional
    public void deleteCourse(Long ownerId, Long courseId) {
        Course course = findOwnedCourse(ownerId, courseId);
        courseRepository.delete(course);
    }

    private AppUser findUser(Long userId) {
        return appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User with ID " + userId + " was not found"
                ));
    }

    private Course findOwnedCourse(Long ownerId, Long courseId) {
        return courseRepository
                .findByIdAndOwnerId(courseId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course with ID " + courseId
                                + " was not found for user " + ownerId
                ));
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}