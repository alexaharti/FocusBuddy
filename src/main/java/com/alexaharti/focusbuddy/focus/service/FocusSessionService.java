package com.alexaharti.focusbuddy.focus.service;

import com.alexaharti.focusbuddy.course.entity.Course;
import com.alexaharti.focusbuddy.course.entity.Topic;
import com.alexaharti.focusbuddy.course.repository.CourseRepository;
import com.alexaharti.focusbuddy.course.repository.TopicRepository;
import com.alexaharti.focusbuddy.focus.dto.FocusSessionResponse;
import com.alexaharti.focusbuddy.focus.dto.StartFocusSessionRequest;
import com.alexaharti.focusbuddy.focus.entity.FocusSession;
import com.alexaharti.focusbuddy.focus.entity.FocusSessionStatus;
import com.alexaharti.focusbuddy.focus.entity.FocusSessionType;
import com.alexaharti.focusbuddy.focus.mapper.FocusSessionMapper;
import com.alexaharti.focusbuddy.focus.repository.FocusSessionRepository;
import com.alexaharti.focusbuddy.user.entity.AppUser;
import com.alexaharti.focusbuddy.user.repository.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class FocusSessionService {

    private final FocusSessionRepository focusSessionRepository;
    private final AppUserRepository appUserRepository;
    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final FocusSessionMapper focusSessionMapper;

    public FocusSessionService(
            FocusSessionRepository focusSessionRepository,
            AppUserRepository appUserRepository,
            CourseRepository courseRepository,
            TopicRepository topicRepository,
            FocusSessionMapper focusSessionMapper
    ) {
        this.focusSessionRepository = focusSessionRepository;
        this.appUserRepository = appUserRepository;
        this.courseRepository = courseRepository;
        this.topicRepository = topicRepository;
        this.focusSessionMapper = focusSessionMapper;
    }

    public FocusSessionResponse startSession(
            Long userId,
            StartFocusSessionRequest request
    ) {
        AppUser user =
                appUserRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "User not found."
                                )
                        );

        validateRequest(request);

        Course course = null;
        Topic topic = null;

        if (request.courseId() != null) {
            course =
                    courseRepository
                            .findByIdAndOwnerId(
                                    request.courseId(),
                                    userId
                            )
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Course not found."
                                    )
                            );
        }

        if (request.topicId() != null) {
            if (course == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A topic cannot be selected without a course."
                );
            }

            topic =
                    topicRepository
                            .findByIdAndCourseId(
                                    request.topicId(),
                                    course.getId()
                            )
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Topic not found."
                                    )
                            );
        }

        FocusSession session =
                new FocusSession();

        session.setUser(user);
        session.setCourse(course);
        session.setTopic(topic);
        session.setSessionType(request.sessionType());
        session.setStatus(
                FocusSessionStatus.ACTIVE
        );
        session.setPlannedDurationMinutes(
                request.plannedDurationMinutes()
        );
        session.setStartedAt(Instant.now());

        FocusSession saved =
                focusSessionRepository.save(session);

        return focusSessionMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FocusSessionResponse> getSessions(
            Long userId
    ) {
        return focusSessionRepository
                .findAllByUserIdOrderByStartedAtDesc(
                        userId
                )
                .stream()
                .map(focusSessionMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FocusSessionResponse getSession(
            Long userId,
            Long sessionId
    ) {
        return focusSessionMapper.toResponse(
                getOwnedSession(
                        userId,
                        sessionId
                )
        );
    }

    public FocusSessionResponse completeSession(
            Long userId,
            Long sessionId
    ) {
        FocusSession session =
                getOwnedSession(
                        userId,
                        sessionId
                );

        if (
                session.getStatus()
                        != FocusSessionStatus.ACTIVE
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only an active session can be completed."
            );
        }

        Instant completedAt =
                Instant.now();

        long durationSeconds =
                Duration.between(
                        session.getStartedAt(),
                        completedAt
                ).getSeconds();

        int durationMinutes =
                (int) Math.max(
                        1,
                        Math.ceil(
                                durationSeconds / 60.0
                        )
                );

        session.setStatus(
                FocusSessionStatus.COMPLETED
        );

        session.setCompletedAt(
                completedAt
        );

        session.setActualDurationMinutes(
                durationMinutes
        );

        FocusSession saved =
                focusSessionRepository.save(session);

        return focusSessionMapper.toResponse(saved);
    }

    public FocusSessionResponse cancelSession(
            Long userId,
            Long sessionId
    ) {
        FocusSession session =
                getOwnedSession(
                        userId,
                        sessionId
                );

        if (
                session.getStatus()
                        != FocusSessionStatus.ACTIVE
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only an active session can be cancelled."
            );
        }

        session.setStatus(
                FocusSessionStatus.CANCELLED
        );

        session.setCompletedAt(
                Instant.now()
        );

        FocusSession saved =
                focusSessionRepository.save(session);

        return focusSessionMapper.toResponse(saved);
    }

    private FocusSession getOwnedSession(
            Long userId,
            Long sessionId
    ) {
        return focusSessionRepository
                .findByIdAndUserId(
                        sessionId,
                        userId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Focus Session not found."
                        )
                );
    }

    private void validateRequest(
            StartFocusSessionRequest request
    ) {
        if (
                request.sessionType()
                        == FocusSessionType.PLANNED
                        &&
                        request.plannedDurationMinutes()
                                == null
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Planned sessions require a duration."
            );
        }

        if (
                request.sessionType()
                        == FocusSessionType.QUICK
                        &&
                        request.plannedDurationMinutes()
                                != null
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quick Focus sessions do not use a planned duration."
            );
        }
    }
}