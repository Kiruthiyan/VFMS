CREATE TABLE driver_availability (
    driver_id   UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (status IN ('AVAILABLE','ON_TRIP','ON_LEAVE','INACTIVE')),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by  VARCHAR(100),
    reason      TEXT
);

CREATE TABLE driver_availability_log (
    id          BIGSERIAL PRIMARY KEY,
    driver_id   UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    old_status  VARCHAR(20),
    new_status  VARCHAR(20),
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by  VARCHAR(100),
    reason      TEXT
);

CREATE INDEX idx_avail_log_driver ON driver_availability_log(driver_id);
CREATE INDEX idx_avail_status ON driver_availability(status);
