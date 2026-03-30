CREATE TABLE driver_certifications (
    id           BIGSERIAL PRIMARY KEY,
    driver_id    UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    cert_type    VARCHAR(50) NOT NULL
                     CHECK (cert_type IN ('DEFENSIVE_DRIVING','FIRST_AID','HAZMAT','HEAVY_VEHICLE','PASSENGER_TRANSPORT','OTHER')),
    cert_name    VARCHAR(200) NOT NULL,
    issued_by    VARCHAR(150),
    issue_date   DATE NOT NULL,
    expiry_date  DATE,
    document_url TEXT,
    status       VARCHAR(20) NOT NULL DEFAULT 'VALID'
                     CHECK (status IN ('VALID','EXPIRING_SOON','EXPIRED')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cert_driver_id ON driver_certifications(driver_id);
CREATE INDEX idx_cert_expiry ON driver_certifications(expiry_date);
CREATE INDEX idx_cert_status ON driver_certifications(status);
