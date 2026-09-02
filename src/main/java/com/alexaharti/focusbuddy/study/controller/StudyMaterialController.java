package com.alexaharti.focusbuddy.study.controller;

import com.alexaharti.focusbuddy.common.security.CurrentUserService;
import com.alexaharti.focusbuddy.study.dto.StudyMaterialResponse;
import com.alexaharti.focusbuddy.study.entity.StudyMaterialType;
import com.alexaharti.focusbuddy.study.service.StudyMaterialService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping(
        "/api/courses/{courseId}/topics/{topicId}/study-materials"
)
public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;

    private final CurrentUserService currentUserService;

    public StudyMaterialController(
            StudyMaterialService studyMaterialService,
            CurrentUserService currentUserService
    ) {
        this.studyMaterialService = studyMaterialService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/{materialType}")
    public ResponseEntity<StudyMaterialResponse>
    generateOrGetMaterial(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId,
            @PathVariable Long topicId,
            @PathVariable String materialType
    ) {
        Long userId =
                currentUserService.getUserId(jwt);

        StudyMaterialType type =
                parseMaterialType(materialType);

        return ResponseEntity.ok(
                studyMaterialService.generateOrGetMaterial(
                        userId,
                        courseId,
                        topicId,
                        type
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<StudyMaterialResponse>>
    getMaterials(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId,
            @PathVariable Long topicId
    ) {
        Long userId =
                currentUserService.getUserId(jwt);

        return ResponseEntity.ok(
                studyMaterialService.getMaterials(
                        userId,
                        courseId,
                        topicId
                )
        );
    }

    @GetMapping("/{materialType}")
    public ResponseEntity<StudyMaterialResponse>
    getMaterial(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long courseId,
            @PathVariable Long topicId,
            @PathVariable String materialType
    ) {
        Long userId =
                currentUserService.getUserId(jwt);

        StudyMaterialType type =
                parseMaterialType(materialType);

        return ResponseEntity.ok(
                studyMaterialService.getMaterial(
                        userId,
                        courseId,
                        topicId,
                        type
                )
        );
    }

    private StudyMaterialType parseMaterialType(
            String materialType
    ) {
        String normalized =
                materialType
                        .trim()
                        .replace("-", "_")
                        .toUpperCase(Locale.ROOT);

        try {
            return StudyMaterialType.valueOf(
                    normalized
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Unknown Study Material type: "
                            + materialType
            );
        }
    }
}