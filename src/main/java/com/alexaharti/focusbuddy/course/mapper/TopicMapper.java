package com.alexaharti.focusbuddy.course.mapper;

import com.alexaharti.focusbuddy.ai.document.Document;
import com.alexaharti.focusbuddy.course.dto.TopicResponse;
import com.alexaharti.focusbuddy.course.entity.Topic;

public final class TopicMapper {

    private TopicMapper() {
    }

    public static TopicResponse toResponse(Topic topic) {
        Document document = topic.getDocument();

        return new TopicResponse(
                topic.getId(),
                topic.getCourse().getId(),
                topic.getTitle(),
                topic.getDescription(),
                topic.getPosition(),
                topic.getStatus(),
                document == null ? null : document.getId(),
                document == null ? null : document.getOriginalFilename(),
                document == null ? null : document.getFileSize(),
                document == null
                        ? null
                        : document.getProcessingStatus(),
                topic.getCreatedAt(),
                topic.getUpdatedAt()
        );
    }
}