-- VFMS Driver & Staff Management (DSM) - Supabase PostgreSQL reference schema
-- Canonical auth identity remains users(id). Driver operational data is stored
-- in one physical drivers table and mapped directly by DriverAggregate.

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
-- Consolidated driver aggregate (the only physical driver data table)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT LOCALTIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    version BIGINT NOT NULL DEFAULT 0,
    address VARCHAR(255),
    date_of_birth DATE,
    date_of_joining DATE,
    department VARCHAR(255),
    designation VARCHAR(255),
    email VARCHAR(255),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(255),
    employee_id VARCHAR(255),
    first_name VARCHAR(255),
    full_name VARCHAR(255),
    last_name VARCHAR(255),
    license_expiry_date DATE,
    license_number VARCHAR(255),
    nic VARCHAR(255),
    phone VARCHAR(255),
    photo_url VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    legacy_unmatched BOOLEAN NOT NULL DEFAULT FALSE,
    licenses JSONB NOT NULL DEFAULT '[]'::jsonb,
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    infractions JSONB NOT NULL DEFAULT '[]'::jsonb,
    leaves JSONB NOT NULL DEFAULT '[]'::jsonb,
    performance_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
    readiness_license_valid BOOLEAN NOT NULL DEFAULT FALSE,
    readiness_all_certs_valid BOOLEAN NOT NULL DEFAULT TRUE,
    readiness_on_leave_today BOOLEAN NOT NULL DEFAULT FALSE,
    readiness_not_ready_reason VARCHAR(255),
    readiness_last_refreshed TIMESTAMP WITHOUT TIME ZONE,
    readiness_availability_status VARCHAR(255),
    CONSTRAINT drivers_licenses_json_array CHECK (jsonb_typeof(licenses) = 'array'),
    CONSTRAINT drivers_certifications_json_array CHECK (jsonb_typeof(certifications) = 'array'),
    CONSTRAINT drivers_documents_json_array CHECK (jsonb_typeof(documents) = 'array'),
    CONSTRAINT drivers_infractions_json_array CHECK (jsonb_typeof(infractions) = 'array'),
    CONSTRAINT drivers_leaves_json_array CHECK (jsonb_typeof(leaves) = 'array'),
    CONSTRAINT drivers_performance_json_array CHECK (jsonb_typeof(performance_scores) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_employee_id ON drivers(employee_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_licenses_gin ON drivers USING GIN(licenses);
CREATE INDEX IF NOT EXISTS idx_drivers_certifications_gin ON drivers USING GIN(certifications);
CREATE INDEX IF NOT EXISTS idx_drivers_documents_gin ON drivers USING GIN(documents);
CREATE INDEX IF NOT EXISTS idx_drivers_infractions_gin ON drivers USING GIN(infractions);
CREATE INDEX IF NOT EXISTS idx_drivers_leaves_gin ON drivers USING GIN(leaves);
CREATE INDEX IF NOT EXISTS idx_drivers_performance_gin ON drivers USING GIN(performance_scores);

-- Migration validation and the users -> drivers synchronization trigger are
-- defined by V22. V23 removes the temporary compatibility views used during
-- the staged cutover.
