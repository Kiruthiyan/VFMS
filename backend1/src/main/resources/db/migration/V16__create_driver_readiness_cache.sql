CREATE TABLE driver_readiness_cache (
    driver_id           UUID PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
    license_valid       BOOLEAN NOT NULL DEFAULT FALSE,
    all_certs_valid     BOOLEAN NOT NULL DEFAULT TRUE,
    availability_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    last_refreshed      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_readiness_status ON driver_readiness_cache(availability_status);
CREATE INDEX idx_readiness_license ON driver_readiness_cache(license_valid);
