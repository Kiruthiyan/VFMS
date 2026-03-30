CREATE TABLE notification_log (
    id                BIGSERIAL PRIMARY KEY,
    entity_type       VARCHAR(50),
    entity_id         UUID,
    notification_type VARCHAR(50),
    message           TEXT,
    sent_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_entity ON notification_log(entity_type, entity_id);
CREATE INDEX idx_notification_sent_at ON notification_log(sent_at);
