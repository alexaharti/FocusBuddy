package com.alexaharti.focusbuddy.ai.document;

import com.alexaharti.focusbuddy.common.exception.PdfProcessingException;
import com.alexaharti.focusbuddy.common.exception.ResourceNotFoundException;
import com.alexaharti.focusbuddy.course.entity.Topic;
import com.alexaharti.focusbuddy.course.repository.CourseRepository;
import com.alexaharti.focusbuddy.course.repository.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DocumentProcessingService {

    private static final int PREVIEW_LENGTH = 180;

    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final DocumentRepository documentRepository;
    private final PdfExtractionService pdfExtractionService;

    public DocumentProcessingService(
            CourseRepository courseRepository,
            TopicRepository topicRepository,
            DocumentRepository documentRepository,
            PdfExtractionService pdfExtractionService
    ) {
        this.courseRepository = courseRepository;
        this.topicRepository = topicRepository;
        this.documentRepository = documentRepository;
        this.pdfExtractionService = pdfExtractionService;
    }

    @Transactional
    public DocumentProcessingResponse processDocument(
            Long ownerId,
            Long courseId,
            Long topicId
    ) {
        verifyCourseOwnership(ownerId, courseId);

        Topic topic = topicRepository
                .findByIdAndCourseId(topicId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Topic with ID " + topicId
                                + " was not found in course " + courseId
                ));

        Document document = documentRepository
                .findByTopicId(topic.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No PDF document was found for topic " + topicId
                ));

        document.setProcessingStatus(
                DocumentProcessingStatus.PROCESSING
        );
        document.setProcessedAt(null);
        documentRepository.saveAndFlush(document);

        try {
            PdfExtractionResult extraction =
                    pdfExtractionService.extract(
                            document.getStoragePath()
                    );

            Instant processedAt = Instant.now();

            document.setPageCount(extraction.pageCount());
            document.setProcessingStatus(
                    DocumentProcessingStatus.READY
            );
            document.setProcessedAt(processedAt);

            documentRepository.save(document);

            int characterCount = extraction.pages()
                    .stream()
                    .mapToInt(page -> page.text().length())
                    .sum();

            List<DocumentProcessingResponse.PagePreview> previews =
                    extraction.pages()
                            .stream()
                            .limit(5)
                            .map(page ->
                                    new DocumentProcessingResponse.PagePreview(
                                            page.pageNumber(),
                                            page.text().length(),
                                            createPreview(page.text())
                                    )
                            )
                            .toList();

            return new DocumentProcessingResponse(
                    document.getId(),
                    topic.getId(),
                    document.getOriginalFilename(),
                    document.getPageCount(),
                    document.getProcessingStatus(),
                    characterCount,
                    previews,
                    processedAt
            );
        } catch (RuntimeException exception) {
            document.setProcessingStatus(
                    DocumentProcessingStatus.FAILED
            );
            document.setProcessedAt(Instant.now());
            documentRepository.save(document);

            if (exception instanceof PdfProcessingException) {
                throw exception;
            }

            throw new PdfProcessingException(
                    "Unexpected error while processing the PDF",
                    exception
            );
        }
    }

    private void verifyCourseOwnership(
            Long ownerId,
            Long courseId
    ) {
        courseRepository
                .findByIdAndOwnerId(courseId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course with ID " + courseId
                                + " was not found for user " + ownerId
                ));
    }

    private String createPreview(String text) {
        if (text == null || text.isBlank()) {
            return "[No extractable text on this page]";
        }

        if (text.length() <= PREVIEW_LENGTH) {
            return text;
        }

        return text.substring(0, PREVIEW_LENGTH).trim() + "...";
    }
}