package com.alexaharti.focusbuddy.ai.rag;

import com.alexaharti.focusbuddy.ai.document.PdfExtractionResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TextChunkingService {

    private static final int MAX_CHUNK_LENGTH = 1000;
    private static final int CHUNK_OVERLAP = 180;

    public List<TextChunk> createChunks(
            PdfExtractionResult extraction
    ) {
        List<TextChunk> chunks = new ArrayList<>();

        for (PdfExtractionResult.ExtractedPage page : extraction.pages()) {
            chunks.addAll(chunkPage(page));
        }

        return List.copyOf(chunks);
    }

    private List<TextChunk> chunkPage(
            PdfExtractionResult.ExtractedPage page
    ) {
        List<TextChunk> chunks = new ArrayList<>();
        String text = page.text();

        if (text == null || text.isBlank()) {
            return chunks;
        }

        int start = 0;
        int chunkIndex = 0;

        while (start < text.length()) {
            int desiredEnd = Math.min(
                    start + MAX_CHUNK_LENGTH,
                    text.length()
            );

            int end = findNaturalEnd(text, start, desiredEnd);

            String content = text.substring(start, end).trim();

            if (!content.isBlank()) {
                chunks.add(
                        new TextChunk(
                                page.pageNumber(),
                                chunkIndex,
                                content
                        )
                );
                chunkIndex++;
            }

            if (end >= text.length()) {
                break;
            }

            int nextStart = Math.max(
                    end - CHUNK_OVERLAP,
                    start + 1
            );

            start = nextStart;
        }

        return chunks;
    }

    private int findNaturalEnd(
            String text,
            int start,
            int desiredEnd
    ) {
        if (desiredEnd >= text.length()) {
            return text.length();
        }

        int minimumEnd = Math.min(
                start + MAX_CHUNK_LENGTH / 2,
                desiredEnd
        );

        int paragraphBreak = text.lastIndexOf("\n\n", desiredEnd);

        if (paragraphBreak >= minimumEnd) {
            return paragraphBreak;
        }

        int lineBreak = text.lastIndexOf('\n', desiredEnd);

        if (lineBreak >= minimumEnd) {
            return lineBreak;
        }

        int sentenceEnd = findLastSentenceEnd(
                text,
                minimumEnd,
                desiredEnd
        );

        if (sentenceEnd >= minimumEnd) {
            return sentenceEnd;
        }

        int whitespace = text.lastIndexOf(' ', desiredEnd);

        if (whitespace >= minimumEnd) {
            return whitespace;
        }

        return desiredEnd;
    }

    private int findLastSentenceEnd(
            String text,
            int minimumEnd,
            int desiredEnd
    ) {
        for (int index = desiredEnd - 1;
             index >= minimumEnd;
             index--) {

            char character = text.charAt(index);

            if (character == '.'
                    || character == '?'
                    || character == '!') {
                return index + 1;
            }
        }

        return -1;
    }
}