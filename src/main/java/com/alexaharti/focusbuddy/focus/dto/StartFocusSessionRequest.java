package com.alexaharti.focusbuddy.focus.dto;

import com.alexaharti.focusbuddy.focus.entity.FocusSessionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StartFocusSessionRequest(

        @NotNull(message = "Session type is required")
        FocusSessionType sessionType,

        Long courseId,

        Long topicId,

        @Min(
                value = 1,
                message = "Planned duration must be at least 1 minute"
        )
        Integer plannedDurationMinutes
) {
}