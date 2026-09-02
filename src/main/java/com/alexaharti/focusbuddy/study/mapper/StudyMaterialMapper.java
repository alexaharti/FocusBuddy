package com.alexaharti.focusbuddy.study.mapper;

import com.alexaharti.focusbuddy.study.dto.StudyMaterialResponse;
import com.alexaharti.focusbuddy.study.entity.StudyMaterial;
import org.springframework.stereotype.Component;

@Component
public class StudyMaterialMapper {

    public StudyMaterialResponse toResponse(
            StudyMaterial studyMaterial
    ) {
        return new StudyMaterialResponse(
                studyMaterial.getId(),
                studyMaterial.getTopic().getId(),
                studyMaterial.getMaterialType(),
                studyMaterial.getContent(),
                studyMaterial.getCreatedAt(),
                studyMaterial.getUpdatedAt()
        );
    }
}