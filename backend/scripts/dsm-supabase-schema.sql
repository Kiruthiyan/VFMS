-- VFMS Driver & Staff Management (DSM) — Supabase PostgreSQL reference schema
-- Canonical identity: users (UUID) + employee_registry for staff pre-provisioning.
-- Apply manually on Supabase; Hibernate ddl-auto=update also maintains these tables at runtime.
--
-- Optional legacy cleanup (run only after confirming no data dependency):
-- DROP TABLE IF EXISTS staff_service_requests, staff, driver_availability_log,
--   driver_availability, drivers CASCADE;

-- ---------------------------------------------------------------------------
-- Employee registry (staff pre-provisioning before self-registration)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_registry (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     VARCHAR(50) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    nic             VARCHAR(20) NOT NULL UNIQUE,
    phone           VARCHAR(20) NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    department      VARCHAR(100) NOT NULL,
    designation     VARCHAR(100) NOT NULL,
    office_location VARCHAR(150) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------------
-- Driver sub-resources (all FK → users.id)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS driver_licenses (
    id                BIGSERIAL PRIMARY KEY,
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number    VARCHAR(50) UNIQUE NOT NULL,
    category          VARCHAR(10) NOT NULL,
    issuing_authority VARCHAR(150),
    issue_date        DATE NOT NULL,
    expiry_date       DATE NOT NULL,
    document_url      TEXT,
    is_primary        BOOLEAN DEFAULT FALSE,
    status            VARCHAR(20) NOT NULL DEFAULT 'VALID',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_driver_licenses_user_id ON driver_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_expiry ON driver_licenses(expiry_date);

CREATE TABLE IF NOT EXISTS driver_certifications (
    id           BIGSERIAL PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cert_type    VARCHAR(50) NOT NULL,
    cert_name    VARCHAR(150) NOT NULL,
    issued_by    VARCHAR(150),
    issue_date   DATE,
    expiry_date  DATE,
    status       VARCHAR(20) NOT NULL DEFAULT 'VALID',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_driver_certifications_user_id ON driver_certifications(user_id);

CREATE TABLE IF NOT EXISTS driver_documents (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(30) NOT NULL,
    entity_id   BIGINT,
    file_name   VARCHAR(255) NOT NULL,
    file_url    TEXT NOT NULL,
    mime_type   VARCHAR(100),
    file_size   BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_driver_documents_user_id ON driver_documents(user_id);

CREATE TABLE IF NOT EXISTS driver_infractions (
    id                BIGSERIAL PRIMARY KEY,
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    infraction_type   VARCHAR(30) NOT NULL,
    severity          VARCHAR(20) NOT NULL,
    incident_date     DATE NOT NULL,
    description       TEXT,
    resolution_status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    resolved_at       DATE,
    penalty_notes     TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_driver_infractions_user_id ON driver_infractions(user_id);

CREATE TABLE IF NOT EXISTS driver_leaves (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type      VARCHAR(20) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    reason          TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by     VARCHAR(100),
    approval_notes  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_driver_leaves_user_id ON driver_leaves(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_leaves_status ON driver_leaves(status);

CREATE TABLE IF NOT EXISTS driver_service_requests (
    id           BIGSERIAL PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id   BIGINT,
    request_type VARCHAR(30) NOT NULL,
    description  TEXT,
    urgency      VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    status       VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_driver_service_requests_user_id ON driver_service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_service_requests_status ON driver_service_requests(status);

CREATE TABLE IF NOT EXISTS driver_readiness_cache (
    user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_valid    BOOLEAN NOT NULL DEFAULT FALSE,
    all_certs_valid  BOOLEAN NOT NULL DEFAULT TRUE,
    on_leave_today   BOOLEAN NOT NULL DEFAULT FALSE,
    not_ready_reason TEXT,
    last_refreshed   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS driver_performance_scores (
    id           BIGSERIAL PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score_type   VARCHAR(50) NOT NULL,
    score_value  DOUBLE PRECISION NOT NULL,
    period_start DATE,
    period_end   DATE,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_driver_performance_scores_user_id ON driver_performance_scores(user_id);
