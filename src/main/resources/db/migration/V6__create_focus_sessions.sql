CREATE TABLE focus_sessions
(
    id                       BIGSERIAL PRIMARY KEY,
    user_id                  BIGINT                   NOT NULL,
    course_id                BIGINT,
    topic_id                 BIGINT,
    session_type             VARCHAR(20)              NOT NULL,
    status                   VARCHAR(20)              NOT NULL,
    planned_duration_minutes INTEGER,
    actual_duration_minutes  INTEGER,
    started_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at             TIMESTAMP WITH TIME ZONE,
    created_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at               TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_focus_sessions_user
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE,

    CONSTRAINT fk_focus_sessions_course
        FOREIGN KEY (course_id)
            REFERENCES courses (id)
            ON DELETE SET NULL,

    CONSTRAINT fk_focus_sessions_topic
        FOREIGN KEY (topic_id)
            REFERENCES topics (id)
            ON DELETE SET NULL
);