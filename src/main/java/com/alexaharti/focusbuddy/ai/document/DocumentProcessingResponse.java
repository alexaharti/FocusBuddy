package com.alexaharti.focusbuddy.ai.document;

import java.time.Instant;
import java.util.List;

public record DocumentProcessingResponse(
        Long documentId,
        Long topicId,
        String originalFilename,
        Integer pageCount,
        DocumentProcessingStatus processingStatus,
        int extractedCharacterCount,
        int storedChunkCount,
        List<PagePreview> pagePreviews,
        Instant processedAt
) {

    public record PagePreview(
            int pageNumber,
            int characterCount,
            String preview
    ) {
    }
}