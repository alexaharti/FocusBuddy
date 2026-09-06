package com.alexaharti.focusbuddy.focus.dto;

import com.alexaharti.focusbuddy.focus.entity.FocusSessionStatus;
import com.alexaharti.focusbuddy.focus.entity.FocusSessionType;

import java.time.Instant;

public record FocusSessionResponse(
        Long id,
        Long courseId,
        Long topicId,
        FocusSessionType sessionType,
        FocusSessionStatus status,
        Integer plannedDurationMinutes,
        Integer actualDurationMinutes,
        Long accumulatedFocusSeconds,
        Instant lastResumedAt,
        Instant startedAt,
        Instant completedAt,
        Instant createdAt,
        Instant updatedAt
) {
}