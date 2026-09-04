package com.alexaharti.focusbuddy.focus.repository;

import com.alexaharti.focusbuddy.focus.entity.FocusSession;
import com.alexaharti.focusbuddy.focus.entity.FocusSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FocusSessionRepository
        extends JpaRepository<FocusSession, Long> {

    List<FocusSession> findAllByUserIdOrderByStartedAtDesc(
            Long userId
    );

    Optional<FocusSession> findByIdAndUserId(
            Long id,
            Long userId
    );

    List<FocusSession> findAllByUserIdAndStatusOrderByStartedAtDesc(
            Long userId,
            FocusSessionStatus status
    );
}