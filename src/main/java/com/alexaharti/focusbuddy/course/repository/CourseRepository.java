package com.alexaharti.focusbuddy.course.repository;

import com.alexaharti.focusbuddy.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Course> findByIdAndOwnerId(Long courseId, Long ownerId);
}