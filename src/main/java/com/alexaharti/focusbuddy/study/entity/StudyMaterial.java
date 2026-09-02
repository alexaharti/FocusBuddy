package com.alexaharti.focusbuddy.study.entity;

import com.alexaharti.focusbuddy.course.entity.Topic;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "study_materials",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_study_material_topic_type",
                        columnNames = {
                                "topic_id",
                                "material_type"
                        }
                )
        }
)
public class StudyMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "topic_id",
            nullable = false
    )
    private Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "material_type",
            nullable = false,
            length = 40
    )
    private StudyMaterialType materialType;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String content;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}