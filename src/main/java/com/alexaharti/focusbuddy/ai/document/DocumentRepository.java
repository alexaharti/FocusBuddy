package com.alexaharti.focusbuddy.ai.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    Optional<Document> findByTopicId(Long topicId);

    boolean existsByTopicId(Long topicId);
}