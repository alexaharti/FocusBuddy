package com.alexaharti.focusbuddy.study.repository;

import com.alexaharti.focusbuddy.study.entity.StudyMaterial;
import com.alexaharti.focusbuddy.study.entity.StudyMaterialType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyMaterialRepository
        extends JpaRepository<StudyMaterial, Long> {

    Optional<StudyMaterial> findByTopicIdAndMaterialType(
            Long topicId,
            StudyMaterialType materialType
    );

    List<StudyMaterial> findAllByTopicId(Long topicId);

    boolean existsByTopicIdAndMaterialType(
            Long topicId,
            StudyMaterialType materialType
    );
}