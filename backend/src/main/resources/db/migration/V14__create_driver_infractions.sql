CREATE TABLE driver_infractions (
    id                BIGSERIAL PRIMARY KEY,
    driver_id         UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    infraction_type   VARCHAR(30) NOT NULL
                          CHECK (infraction_type IN ('TRAFFIC_VIOLATION','MINOR_ACCIDENT','MAJOR_ACCIDENT','NEAR_MISS','RECKLESS_DRIVING','OTHER')),
    severity          VARCHAR(10) NOT NULL
                          CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    incident_date     DATE NOT NULL,
    description       TEXT,
    resolution_status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                          CHECK (resolution_status IN ('OPEN','UNDER_REVIEW','RESOLVED')),
    resolved_at       DATE,
    penalty_notes     TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_infractions_driver_id ON driver_infractions(driver_id);
CREATE INDEX idx_infractions_severity ON driver_infractions(severity);
CREATE INDEX idx_infractions_status ON driver_infractions(resolution_status);
