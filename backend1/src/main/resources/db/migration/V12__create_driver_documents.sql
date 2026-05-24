CREATE TABLE driver_documents (
    id          BIGSERIAL PRIMARY KEY,
    driver_id   UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL
                    CHECK (entity_type IN ('LICENSE','CERTIFICATION','PROFILE','OTHER')),
    entity_id   BIGINT,
    file_name   VARCHAR(255) NOT NULL,
    file_url    TEXT NOT NULL,
    mime_type   VARCHAR(100),
    file_size   BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX idx_documents_entity ON driver_documents(entity_type, entity_id);
