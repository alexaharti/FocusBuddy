CREATE TABLE study_materials
(
    id            BIGSERIAL PRIMARY KEY,
    topic_id      BIGINT                   NOT NULL,
    material_type VARCHAR(40)              NOT NULL,
    content       TEXT                     NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_study_materials_topic
        FOREIGN KEY (topic_id)
            REFERENCES topics (id)
            ON DELETE CASCADE,

    CONSTRAINT uk_study_material_topic_type
        UNIQUE (topic_id, material_type)
);