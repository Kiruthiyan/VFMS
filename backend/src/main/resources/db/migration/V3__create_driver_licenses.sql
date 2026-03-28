CREATE TABLE driver_licenses (
    id                BIGSERIAL PRIMARY KEY,
    driver_id         BIGINT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    license_number    VARCHAR(50) UNIQUE NOT NULL,
    category          VARCHAR(10) NOT NULL
                          CHECK (category IN ('A','B','C','CE','D','BE')),
    issuing_authority VARCHAR(150),
    issue_date        DATE NOT NULL,
    expiry_date       DATE NOT NULL,
    document_url      TEXT,
    is_primary        BOOLEAN DEFAULT FALSE,
    status            VARCHAR(20) NOT NULL DEFAULT 'VALID'
                          CHECK (status IN ('VALID','EXPIRING_SOON','EXPIRED')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_driver_licenses_driver_id ON driver_licenses(driver_id);
CREATE INDEX idx_driver_licenses_expiry ON driver_licenses(expiry_date);
CREATE INDEX idx_driver_licenses_status ON driver_licenses(status);
