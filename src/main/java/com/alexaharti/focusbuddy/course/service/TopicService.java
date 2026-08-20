package com.alexaharti.focusbuddy.course.service;

import com.alexaharti.focusbuddy.ai.document.Document;
import com.alexaharti.focusbuddy.ai.document.DocumentProcessingStatus;
import com.alexaharti.focusbuddy.ai.document.FileStorageService;
import com.alexaharti.focusbuddy.ai.document.FileStorageService.StoredFile;
import com.alexaharti.focusbuddy.common.exception.ResourceNotFoundException;
import com.alexaharti.focusbuddy.course.dto.TopicResponse;
import com.alexaharti.focusbuddy.course.entity.Course;
import com.alexaharti.focusbuddy.course.entity.Topic;
import com.alexaharti.focusbuddy.course.entity.TopicStatus;
import com.alexaharti.focusbuddy.course.mapper.TopicMapper;
import com.alexaharti.focusbuddy.course.repository.CourseRepository;
import com.alexaharti.focusbuddy.course.repository.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TopicService {

    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final FileStorageService fileStorageService;

    public TopicService(
            CourseRepository courseRepository,
            TopicRepository topicRepository,
            FileStorageService fileStorageService
    ) {
        this.courseRepository = courseRepository;
        this.topicRepository = topicRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public TopicResponse createTopicFromPdf(
            Long ownerId,
            Long courseId,
            String title,
            String description,
            MultipartFile file
    ) {
        Course course = findOwnedCourse(ownerId, courseId);
        String normalizedTitle = normalizeRequiredTitle(title);

        StoredFile storedFile = fileStorageService.storePdf(file);

        try {
            Topic topic = new Topic();
            topic.setTitle(normalizedTitle);
            topic.setDescription(normalizeOptionalText(description));
            topic.setPosition(
                    Math.toIntExact(
                            topicRepository.countByCourseId(courseId) + 1
                    )
            );
            topic.setStatus(TopicStatus.NOT_STARTED);

            Document document = new Document();
            document.setOriginalFilename(storedFile.originalFilename());
            document.setStoredFilename(storedFile.storedFilename());
            document.setStoragePath(storedFile.storagePath());
            document.setMimeType(
                    storedFile.mimeType() == null
                            ? "application/pdf"
                            : storedFile.mimeType()
            );
            document.setFileSize(storedFile.fileSize());
            document.setProcessingStatus(
                    DocumentProcessingStatus.UPLOADED
            );

            course.addTopic(topic);
            topic.attachDocument(document);

            Topic savedTopic = topicRepository.save(topic);

            return TopicMapper.toResponse(savedTopic);
        } catch (RuntimeException exception) {
            fileStorageService.deleteQuietly(storedFile.storagePath());
            throw exception;
        }
    }

    public List<TopicResponse> getTopics(
            Long ownerId,
            Long courseId
    ) {
        findOwnedCourse(ownerId, courseId);

        return topicRepository
                .findAllByCourseIdOrderByPositionAsc(courseId)
                .stream()
                .map(TopicMapper::toResponse)
                .toList();
    }

    public TopicResponse getTopic(
            Long ownerId,
            Long courseId,
            Long topicId
    ) {
        findOwnedCourse(ownerId, courseId);

        Topic topic = topicRepository
                .findByIdAndCourseId(topicId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Topic with ID " + topicId + " was not found"
                ));

        return TopicMapper.toResponse(topic);
    }

    private Course findOwnedCourse(
            Long ownerId,
            Long courseId
    ) {
        return courseRepository
                .findByIdAndOwnerId(courseId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course with ID " + courseId
                                + " was not found for user " + ownerId
                ));
    }

    private String normalizeRequiredTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Lecture title is required"
            );
        }

        String normalized = title.trim();

        if (normalized.length() > 200) {
            throw new IllegalArgumentException(
                    "Lecture title cannot exceed 200 characters"
            );
        }

        return normalized;
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}