package com.alexaharti.focusbuddy.focus.mapper;

import com.alexaharti.focusbuddy.focus.dto.FocusSessionResponse;
import com.alexaharti.focusbuddy.focus.entity.FocusSession;
import org.springframework.stereotype.Component;

@Component
public class FocusSessionMapper {

    public FocusSessionResponse toResponse(
            FocusSession session
    ) {
        return new FocusSessionResponse(
                session.getId(),
                session.getCourse() != null
                        ? session.getCourse().getId()
                        : null,
                session.getTopic() != null
                        ? session.getTopic().getId()
                        : null,
                session.getSessionType(),
                session.getStatus(),
                session.getPlannedDurationMinutes(),
                session.getActualDurationMinutes(),
                session.getStartedAt(),
                session.getCompletedAt(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }
}