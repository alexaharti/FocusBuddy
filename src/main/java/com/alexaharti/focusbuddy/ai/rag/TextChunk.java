package com.alexaharti.focusbuddy.ai.rag;

public record TextChunk(
        int pageNumber,
        int chunkIndex,
        String content
) {
}