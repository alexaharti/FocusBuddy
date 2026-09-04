package com.alexaharti.focusbuddy.study.service;

import com.alexaharti.focusbuddy.ai.document.Document;
import com.alexaharti.focusbuddy.ai.document.DocumentProcessingStatus;
import com.alexaharti.focusbuddy.ai.document.DocumentRepository;
import com.alexaharti.focusbuddy.course.entity.Topic;
import com.alexaharti.focusbuddy.course.repository.CourseRepository;
import com.alexaharti.focusbuddy.course.repository.TopicRepository;
import com.alexaharti.focusbuddy.study.dto.StudyMaterialResponse;
import com.alexaharti.focusbuddy.study.entity.StudyMaterial;
import com.alexaharti.focusbuddy.study.entity.StudyMaterialType;
import com.alexaharti.focusbuddy.study.mapper.StudyMaterialMapper;
import com.alexaharti.focusbuddy.study.repository.StudyMaterialRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.alexaharti.focusbuddy.study.dto.UpdateStudyMaterialRequest;

import java.util.List;

@Service
public class StudyMaterialService {

    private final CourseRepository courseRepository;

    private final TopicRepository topicRepository;

    private final DocumentRepository documentRepository;

    private final StudyMaterialRepository studyMaterialRepository;

    private final StudyMaterialGenerationService generationService;

    private final StudyMaterialMapper studyMaterialMapper;

    public StudyMaterialService(
            CourseRepository courseRepository,
            TopicRepository topicRepository,
            DocumentRepository documentRepository,
            StudyMaterialRepository studyMaterialRepository,
            StudyMaterialGenerationService generationService,
            StudyMaterialMapper studyMaterialMapper
    ) {
        this.courseRepository = courseRepository;
        this.topicRepository = topicRepository;
        this.documentRepository = documentRepository;
        this.studyMaterialRepository = studyMaterialRepository;
        this.generationService = generationService;
        this.studyMaterialMapper = studyMaterialMapper;
    }

    @Transactional
    public StudyMaterialResponse generateOrGetMaterial(
            Long ownerId,
            Long courseId,
            Long topicId,
            StudyMaterialType materialType
    ) {
        Topic topic = getOwnedTopic(
                ownerId,
                courseId,
                topicId
        );

        ensureDocumentIsReady(topicId);

        return studyMaterialRepository
                .findByTopicIdAndMaterialType(
                        topicId,
                        materialType
                )
                .map(studyMaterialMapper::toResponse)
                .orElseGet(() -> createMaterial(
                        topic,
                        materialType
                ));
    }

    @Transactional(readOnly = true)
    public StudyMaterialResponse getMaterial(
            Long ownerId,
            Long courseId,
            Long topicId,
            StudyMaterialType materialType
    ) {
        getOwnedTopic(
                ownerId,
                courseId,
                topicId
        );

        StudyMaterial studyMaterial =
                studyMaterialRepository
                        .findByTopicIdAndMaterialType(
                                topicId,
                                materialType
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Study material not found."
                                )
                        );

        return studyMaterialMapper.toResponse(
                studyMaterial
        );
    }

    @Transactional(readOnly = true)
    public List<StudyMaterialResponse> getMaterials(
            Long ownerId,
            Long courseId,
            Long topicId
    ) {
        getOwnedTopic(
                ownerId,
                courseId,
                topicId
        );

        return studyMaterialRepository
                .findAllByTopicId(topicId)
                .stream()
                .map(studyMaterialMapper::toResponse)
                .toList();
    }

    private StudyMaterialResponse createMaterial(
            Topic topic,
            StudyMaterialType materialType
    ) {
        String content =
                generationService.generateMockMaterial(
                        materialType,
                        topic.getTitle()
                );

        StudyMaterial studyMaterial =
                new StudyMaterial();

        studyMaterial.setTopic(topic);
        studyMaterial.setMaterialType(materialType);
        studyMaterial.setContent(content);

        StudyMaterial savedMaterial =
                studyMaterialRepository.save(
                        studyMaterial
                );

        return studyMaterialMapper.toResponse(
                savedMaterial
        );
    }

    private Topic getOwnedTopic(
            Long ownerId,
            Long courseId,
            Long topicId
    ) {
        courseRepository
                .findByIdAndOwnerId(
                        courseId,
                        ownerId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Course not found."
                        )
                );

        return topicRepository
                .findByIdAndCourseId(
                        topicId,
                        courseId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Topic not found."
                        )
                );
    }

    private void ensureDocumentIsReady(Long topicId) {
        Document document =
                documentRepository
                        .findByTopicId(topicId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Upload lecture material before generating Study Materials."
                                )
                        );

        if (document.getProcessingStatus()
                != DocumentProcessingStatus.READY) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The lecture must finish processing before generating Study Materials."
            );
        }
    }

    public StudyMaterialResponse updateMaterial(
            Long ownerId,
            Long courseId,
            Long topicId,
            StudyMaterialType materialType,
            UpdateStudyMaterialRequest request
    ) {
        Topic topic = getOwnedTopic(
                ownerId,
                courseId,
                topicId
        );

        if (materialType != StudyMaterialType.FLASHCARDS) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only flashcards can currently be edited."
            );
        }

        StudyMaterial material =
                studyMaterialRepository
                        .findByTopicIdAndMaterialType(
                                topic.getId(),
                                materialType
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Study Material not found."
                                )
                        );

        material.setContent(request.content());

        StudyMaterial saved =
                studyMaterialRepository.save(material);

        return studyMaterialMapper.toResponse(saved);
    }

    public void deleteMaterial(
            Long ownerId,
            Long courseId,
            Long topicId,
            StudyMaterialType materialType
    ) {
        Topic topic = getOwnedTopic(
                ownerId,
                courseId,
                topicId
        );

        StudyMaterial material =
                studyMaterialRepository
                        .findByTopicIdAndMaterialType(
                                topic.getId(),
                                materialType
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Study Material not found."
                                )
                        );

        studyMaterialRepository.delete(material);
    }
}