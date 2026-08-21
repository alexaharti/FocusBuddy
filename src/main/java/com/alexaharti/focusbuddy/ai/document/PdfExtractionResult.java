package com.alexaharti.focusbuddy.ai.document;

import java.util.List;

public record PdfExtractionResult(
        int pageCount,
        List<ExtractedPage> pages
) {

    public record ExtractedPage(
            int pageNumber,
            String text
    ) {
    }
}