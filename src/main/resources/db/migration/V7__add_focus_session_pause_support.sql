ALTER TABLE focus_sessions
    ADD COLUMN accumulated_focus_seconds BIGINT NOT NULL DEFAULT 0;

ALTER TABLE focus_sessions
    ADD COLUMN last_resumed_at TIMESTAMP WITH TIME ZONE;