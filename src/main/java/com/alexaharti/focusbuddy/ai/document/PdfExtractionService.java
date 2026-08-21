package com.alexaharti.focusbuddy.ai.document;

import com.alexaharti.focusbuddy.common.exception.PdfProcessingException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfExtractionService {

    public PdfExtractionResult extract(String storagePath) {
        Path path = Path.of(storagePath)
                .toAbsolutePath()
                .normalize();

        if (!Files.exists(path)) {
            throw new PdfProcessingException(
                    "The stored PDF file could not be found"
            );
        }

        if (!Files.isRegularFile(path)) {
            throw new PdfProcessingException(
                    "The stored PDF path is not a file"
            );
        }

        try (PDDocument pdf = Loader.loadPDF(path.toFile())) {
            int pageCount = pdf.getNumberOfPages();
            List<PdfExtractionResult.ExtractedPage> pages =
                    new ArrayList<>(pageCount);

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);

            for (int pageNumber = 1;
                 pageNumber <= pageCount;
                 pageNumber++) {

                stripper.setStartPage(pageNumber);
                stripper.setEndPage(pageNumber);

                String extractedText = stripper.getText(pdf);
                String normalizedText = normalizeText(extractedText);

                pages.add(
                        new PdfExtractionResult.ExtractedPage(
                                pageNumber,
                                normalizedText
                        )
                );
            }

            return new PdfExtractionResult(
                    pageCount,
                    List.copyOf(pages)
            );
        } catch (IOException exception) {
            throw new PdfProcessingException(
                    "The uploaded PDF could not be processed",
                    exception
            );
        }
    }

    private String normalizeText(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        return text
                .replace("\u0000", "")
                .replaceAll("[\\t\\x0B\\f\\r ]+", " ")
                .replaceAll(" *\\n *", "\n")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}