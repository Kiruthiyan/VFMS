CREATE TABLE driver_leaves (
    id              BIGSERIAL PRIMARY KEY,
    driver_id       UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    leave_type      VARCHAR(20) NOT NULL
                        CHECK (leave_type IN ('ANNUAL','MEDICAL','EMERGENCY','UNPAID')),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    reason          TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
    approved_by     VARCHAR(100),
    approval_notes  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_leaves_driver_id ON driver_leaves(driver_id);
CREATE INDEX idx_leaves_status ON driver_leaves(status);
CREATE INDEX idx_leaves_dates ON driver_leaves(start_date, end_date);
