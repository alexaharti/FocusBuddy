package com.alexaharti.focusbuddy.course.repository;

import com.alexaharti.focusbuddy.course.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findAllByCourseIdOrderByPositionAsc(Long courseId);

    Optional<Topic> findByIdAndCourseId(Long topicId, Long courseId);

    long countByCourseId(Long courseId);

}