CREATE TABLE driver_performance_scores (
    id                    BIGSERIAL PRIMARY KEY,
    driver_id             UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    period_year           INTEGER NOT NULL,
    period_month          INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    trip_completion_rate  NUMERIC(5,2),
    fuel_efficiency_ratio NUMERIC(5,2),
    infraction_deduction  NUMERIC(5,2),
    feedback_score        NUMERIC(5,2),
    composite_score       NUMERIC(5,2),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_driver_period UNIQUE (driver_id, period_year, period_month)
);

CREATE INDEX idx_perf_driver_id ON driver_performance_scores(driver_id);
CREATE INDEX idx_perf_period ON driver_performance_scores(period_year, period_month);