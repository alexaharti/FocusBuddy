package com.alexaharti.focusbuddy.ai.rag;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentChunkRepository
        extends JpaRepository<DocumentChunk, Long> {

    List<DocumentChunk> findAllByDocumentIdOrderByPageNumberAscChunkIndexAsc(
            Long documentId
    );

    long countByDocumentId(Long documentId);

    void deleteAllByDocumentId(Long documentId);
}