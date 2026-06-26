-- Consolidate all driver_* data into one physical drivers table.
-- Compatibility views preserve the existing JPA mappings and API contracts.

CREATE TEMP TABLE driver_consolidation_expected (
    resource_name TEXT PRIMARY KEY,
    row_count BIGINT NOT NULL
) ON COMMIT DROP;

INSERT INTO driver_consolidation_expected(resource_name, row_count)
VALUES
    ('licenses', (SELECT COUNT(*) FROM driver_licenses)),
    ('certifications', (SELECT COUNT(*) FROM driver_certifications)),
    ('documents', (SELECT COUNT(*) FROM driver_documents)),
    ('infractions', (SELECT COUNT(*) FROM driver_infractions)),
    ('leaves', (SELECT COUNT(*) FROM driver_leaves)),
    ('performance_scores', (SELECT COUNT(*) FROM driver_performance_scores)),
    ('readiness', (
        SELECT COUNT(*)
        FROM driver_readiness_cache r
        JOIN users u ON u.id = r.user_id
        WHERE u.role = 'DRIVER'
    ));

ALTER TABLE drivers RENAME TO drivers_legacy;

CREATE TABLE drivers_consolidated (
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

-- Canonical driver rows are users with role DRIVER. Profile fields are retained
-- from a matching legacy employee record where one exists.
INSERT INTO drivers_consolidated (
    id, user_id, created_at, updated_at, address, date_of_birth, date_of_joining,
    department, designation, email, emergency_contact_name,
    emergency_contact_phone, employee_id, first_name, full_name, last_name,
    license_expiry_date, license_number, nic, phone, photo_url, status,
    licenses, certifications, documents, infractions, leaves, performance_scores,
    readiness_license_valid, readiness_all_certs_valid,
    readiness_on_leave_today, readiness_not_ready_reason,
    readiness_last_refreshed, readiness_availability_status
)
SELECT
    u.id,
    u.id,
    COALESCE(l.created_at, u.created_at, LOCALTIMESTAMP),
    COALESCE(l.updated_at, u.updated_at),
    COALESCE(l.address, u.address),
    l.date_of_birth,
    l.date_of_joining,
    COALESCE(l.department, u.department),
    COALESCE(l.designation, u.designation),
    COALESCE(l.email, u.email),
    COALESCE(l.emergency_contact_name, u.emergency_contact_name),
    COALESCE(l.emergency_contact_phone, u.emergency_contact_phone),
    u.employee_id,
    COALESCE(l.first_name, split_part(COALESCE(u.full_name, ''), ' ', 1)),
    COALESCE(l.full_name, u.full_name),
    COALESCE(l.last_name, NULLIF(regexp_replace(COALESCE(u.full_name, ''), '^\S+\s*', ''), '')),
    COALESCE(l.license_expiry_date, u.license_expiry_date),
    COALESCE(l.license_number, u.license_number),
    COALESCE(l.nic, u.nic),
    COALESCE(l.phone, u.phone),
    COALESCE(l.photo_url, u.photo_url),
    COALESCE(u.status::text, l.status, 'ACTIVE'),
    COALESCE((
        SELECT jsonb_agg(to_jsonb(x) - 'user_id' - 'driver_id' ORDER BY x.created_at DESC, x.id DESC)
        FROM driver_licenses x WHERE x.user_id = u.id
    ), '[]'::jsonb),
    COALESCE((
        SELECT jsonb_agg(to_jsonb(x) - 'user_id' ORDER BY x.created_at DESC, x.id DESC)
        FROM driver_certifications x WHERE x.user_id = u.id
    ), '[]'::jsonb),
    COALESCE((
        SELECT jsonb_agg(to_jsonb(x) - 'user_id' ORDER BY x.created_at DESC, x.id DESC)
        FROM driver_documents x WHERE x.user_id = u.id
    ), '[]'::jsonb),
    COALESCE((
        SELECT jsonb_agg(to_jsonb(x) - 'user_id' ORDER BY x.created_at DESC, x.id DESC)
        FROM driver_infractions x WHERE x.user_id = u.id
    ), '[]'::jsonb),
    COALESCE((
        SELECT jsonb_agg(to_jsonb(x) - 'user_id' - 'driver_id' ORDER BY x.created_at DESC, x.id DESC)
        FROM driver_leaves x WHERE x.user_id = u.id
    ), '[]'::jsonb),
    COALESCE((
        SELECT jsonb_agg(to_jsonb(x) - 'user_id' - 'driver_id' ORDER BY x.period_year DESC, x.period_month DESC, x.id DESC)
        FROM driver_performance_scores x WHERE x.user_id = u.id
    ), '[]'::jsonb),
    COALESCE(r.license_valid, FALSE),
    COALESCE(r.all_certs_valid, TRUE),
    COALESCE(r.on_leave_today, FALSE),
    r.not_ready_reason,
    r.last_refreshed,
    r.availability_status
FROM users u
LEFT JOIN drivers_legacy l ON l.employee_id = u.employee_id
LEFT JOIN driver_readiness_cache r ON r.user_id = u.id
WHERE u.role = 'DRIVER';

-- Preserve unmatched legacy profiles in the same table. They remain visible to
-- legacy trip lookups but are explicitly marked and have no auth-user link.
INSERT INTO drivers_consolidated (
    id, user_id, created_at, updated_at, address, date_of_birth, date_of_joining,
    department, designation, email, emergency_contact_name,
    emergency_contact_phone, employee_id, first_name, full_name, last_name,
    license_expiry_date, license_number, nic, phone, photo_url, status,
    legacy_unmatched
)
SELECT
    l.id, NULL, l.created_at, l.updated_at, l.address, l.date_of_birth,
    l.date_of_joining, l.department, l.designation, l.email,
    l.emergency_contact_name, l.emergency_contact_phone, l.employee_id,
    l.first_name, l.full_name, l.last_name, l.license_expiry_date,
    l.license_number, l.nic, l.phone, l.photo_url, l.status, TRUE
FROM drivers_legacy l
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.role = 'DRIVER' AND u.employee_id = l.employee_id
);

CREATE INDEX idx_drivers_user_id ON drivers_consolidated(user_id);
CREATE INDEX idx_drivers_employee_id ON drivers_consolidated(employee_id);
CREATE INDEX idx_drivers_status ON drivers_consolidated(status);
CREATE INDEX idx_drivers_licenses_gin ON drivers_consolidated USING GIN(licenses);
CREATE INDEX idx_drivers_certifications_gin ON drivers_consolidated USING GIN(certifications);
CREATE INDEX idx_drivers_documents_gin ON drivers_consolidated USING GIN(documents);
CREATE INDEX idx_drivers_infractions_gin ON drivers_consolidated USING GIN(infractions);
CREATE INDEX idx_drivers_leaves_gin ON drivers_consolidated USING GIN(leaves);
CREATE INDEX idx_drivers_performance_gin ON drivers_consolidated USING GIN(performance_scores);

CREATE SEQUENCE driver_embedded_record_id_seq;
SELECT setval(
    'driver_embedded_record_id_seq',
    GREATEST(1, COALESCE((
        SELECT MAX(id) FROM (
            SELECT id FROM driver_licenses
            UNION ALL SELECT id FROM driver_certifications
            UNION ALL SELECT id FROM driver_documents
            UNION ALL SELECT id FROM driver_infractions
            UNION ALL SELECT id FROM driver_leaves
            UNION ALL SELECT id FROM driver_performance_scores
        ) ids
    ), 0)),
    EXISTS (
        SELECT 1 FROM (
            SELECT id FROM driver_licenses
            UNION ALL SELECT id FROM driver_certifications
            UNION ALL SELECT id FROM driver_documents
            UNION ALL SELECT id FROM driver_infractions
            UNION ALL SELECT id FROM driver_leaves
            UNION ALL SELECT id FROM driver_performance_scores
        ) ids
    )
);

DROP TABLE driver_licenses;
DROP TABLE driver_certifications;
DROP TABLE driver_documents;
DROP TABLE driver_infractions;
DROP TABLE driver_leaves;
DROP TABLE driver_performance_scores;
DROP TABLE driver_readiness_cache;
DROP TABLE drivers_legacy;
ALTER TABLE drivers_consolidated RENAME TO drivers;

CREATE VIEW driver_licenses AS
SELECT d.id AS user_id, x.*
FROM drivers d
CROSS JOIN LATERAL jsonb_to_recordset(d.licenses) AS x(
    id BIGINT, created_at TIMESTAMP, updated_at TIMESTAMP,
    category VARCHAR, document_url VARCHAR, expiry_date DATE,
    is_primary BOOLEAN, issue_date DATE, issuing_authority VARCHAR,
    license_number VARCHAR, status VARCHAR
);

CREATE VIEW driver_certifications AS
SELECT d.id AS user_id, x.*
FROM drivers d
CROSS JOIN LATERAL jsonb_to_recordset(d.certifications) AS x(
    id BIGINT, created_at TIMESTAMP, updated_at TIMESTAMP,
    cert_name VARCHAR, cert_type VARCHAR, document_url VARCHAR,
    expiry_date DATE, issue_date DATE, issued_by VARCHAR, status VARCHAR
);

CREATE VIEW driver_documents AS
SELECT d.id AS user_id, x.*
FROM drivers d
CROSS JOIN LATERAL jsonb_to_recordset(d.documents) AS x(
    id BIGINT, created_at TIMESTAMP, updated_at TIMESTAMP,
    entity_id BIGINT, entity_type VARCHAR, file_name VARCHAR,
    file_size BIGINT, file_url VARCHAR, mime_type VARCHAR
);

CREATE VIEW driver_infractions AS
SELECT d.id AS user_id, x.*
FROM drivers d
CROSS JOIN LATERAL jsonb_to_recordset(d.infractions) AS x(
    id BIGINT, created_at TIMESTAMP, updated_at TIMESTAMP,
    description TEXT, incident_date DATE, infraction_type VARCHAR,
    penalty_notes VARCHAR, resolution_status VARCHAR,
    resolved_at DATE, severity VARCHAR
);

CREATE VIEW driver_leaves AS
SELECT d.id AS user_id, x.*
FROM drivers d
CROSS JOIN LATERAL jsonb_to_recordset(d.leaves) AS x(
    id BIGINT, created_at TIMESTAMP, updated_at TIMESTAMP,
    approval_notes VARCHAR, approved_by VARCHAR, end_date DATE,
    leave_type VARCHAR, reason TEXT, start_date DATE, status VARCHAR
);

CREATE VIEW driver_performance_scores AS
SELECT d.id AS user_id, x.*
FROM drivers d
CROSS JOIN LATERAL jsonb_to_recordset(d.performance_scores) AS x(
    id BIGINT, created_at TIMESTAMP, updated_at TIMESTAMP,
    composite_score NUMERIC(5,2), feedback_score NUMERIC(5,2),
    fuel_efficiency_ratio NUMERIC(5,2), infraction_deduction NUMERIC(5,2),
    period_month INTEGER, period_year INTEGER,
    trip_completion_rate NUMERIC(5,2)
);

CREATE VIEW driver_readiness_cache AS
SELECT
    id AS user_id,
    readiness_all_certs_valid AS all_certs_valid,
    readiness_last_refreshed AS last_refreshed,
    readiness_license_valid AS license_valid,
    readiness_not_ready_reason AS not_ready_reason,
    readiness_on_leave_today AS on_leave_today,
    readiness_availability_status AS availability_status
FROM drivers
WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION mutate_driver_json_collection()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    collection_name TEXT := TG_ARGV[0];
    target_driver_id UUID;
    item JSONB;
    affected_rows BIGINT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        target_driver_id := NEW.user_id;
        IF NEW.id IS NULL THEN
            NEW.id := nextval('driver_embedded_record_id_seq');
        END IF;
        IF NEW.created_at IS NULL THEN
            NEW.created_at := LOCALTIMESTAMP;
        END IF;
        item := to_jsonb(NEW) - 'user_id';
        EXECUTE format(
            'UPDATE drivers SET %1$I = COALESCE(%1$I, ''[]''::jsonb) || jsonb_build_array($1), updated_at = LOCALTIMESTAMP, version = version + 1 WHERE id = $2',
            collection_name
        ) USING item, target_driver_id;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        IF affected_rows = 0 THEN
            RAISE EXCEPTION 'Driver % does not exist', target_driver_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Driver resource identity cannot be changed';
        END IF;
        target_driver_id := OLD.user_id;
        NEW.updated_at := LOCALTIMESTAMP;
        item := to_jsonb(NEW) - 'user_id';
        EXECUTE format(
            'UPDATE drivers SET %1$I = COALESCE((SELECT jsonb_agg(CASE WHEN (e.value->>''id'')::bigint = $1 THEN $2 ELSE e.value END ORDER BY e.ordinality) FROM jsonb_array_elements(%1$I) WITH ORDINALITY e), ''[]''::jsonb), updated_at = LOCALTIMESTAMP, version = version + 1 WHERE id = $3',
            collection_name
        ) USING OLD.id, item, target_driver_id;
        RETURN NEW;
    ELSE
        target_driver_id := OLD.user_id;
        EXECUTE format(
            'UPDATE drivers SET %1$I = COALESCE((SELECT jsonb_agg(e.value ORDER BY e.ordinality) FROM jsonb_array_elements(%1$I) WITH ORDINALITY e WHERE (e.value->>''id'')::bigint <> $1), ''[]''::jsonb), updated_at = LOCALTIMESTAMP, version = version + 1 WHERE id = $2',
            collection_name
        ) USING OLD.id, target_driver_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER driver_licenses_mutation
INSTEAD OF INSERT OR UPDATE OR DELETE ON driver_licenses
FOR EACH ROW EXECUTE FUNCTION mutate_driver_json_collection('licenses');

CREATE TRIGGER driver_certifications_mutation
INSTEAD OF INSERT OR UPDATE OR DELETE ON driver_certifications
FOR EACH ROW EXECUTE FUNCTION mutate_driver_json_collection('certifications');

CREATE TRIGGER driver_documents_mutation
INSTEAD OF INSERT OR UPDATE OR DELETE ON driver_documents
FOR EACH ROW EXECUTE FUNCTION mutate_driver_json_collection('documents');

CREATE TRIGGER driver_infractions_mutation
INSTEAD OF INSERT OR UPDATE OR DELETE ON driver_infractions
FOR EACH ROW EXECUTE FUNCTION mutate_driver_json_collection('infractions');

CREATE TRIGGER driver_leaves_mutation
INSTEAD OF INSERT OR UPDATE OR DELETE ON driver_leaves
FOR EACH ROW EXECUTE FUNCTION mutate_driver_json_collection('leaves');

CREATE TRIGGER driver_performance_mutation
INSTEAD OF INSERT OR UPDATE OR DELETE ON driver_performance_scores
FOR EACH ROW EXECUTE FUNCTION mutate_driver_json_collection('performance_scores');

CREATE OR REPLACE FUNCTION mutate_driver_readiness()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE drivers
        SET readiness_license_valid = FALSE,
            readiness_all_certs_valid = TRUE,
            readiness_on_leave_today = FALSE,
            readiness_not_ready_reason = NULL,
            readiness_last_refreshed = NULL,
            readiness_availability_status = NULL,
            updated_at = LOCALTIMESTAMP,
            version = version + 1
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;

    UPDATE drivers
    SET readiness_license_valid = COALESCE(NEW.license_valid, FALSE),
        readiness_all_certs_valid = COALESCE(NEW.all_certs_valid, TRUE),
        readiness_on_leave_today = COALESCE(NEW.on_leave_today, FALSE),
        readiness_not_ready_reason = NEW.not_ready_reason,
        readiness_last_refreshed = NEW.last_refreshed,
        readiness_availability_status = NEW.availability_status,
        updated_at = LOCALTIMESTAMP,
        version = version + 1
    WHERE id = NEW.user_id AND user_id IS NOT NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Canonical driver % does not exist', NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER driver_readiness_mutation
INSTEAD OF INSERT OR UPDATE OR DELETE ON driver_readiness_cache
FOR EACH ROW EXECUTE FUNCTION mutate_driver_readiness();

CREATE OR REPLACE FUNCTION sync_driver_user_to_drivers()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.role = 'DRIVER' THEN
        INSERT INTO drivers (
            id, user_id, created_at, updated_at, address, department,
            designation, email, emergency_contact_name,
            emergency_contact_phone, employee_id, first_name, full_name,
            last_name, license_expiry_date, license_number, nic, phone,
            photo_url, status
        ) VALUES (
            NEW.id, NEW.id, COALESCE(NEW.created_at, LOCALTIMESTAMP),
            NEW.updated_at, NEW.address, NEW.department, NEW.designation,
            NEW.email, NEW.emergency_contact_name, NEW.emergency_contact_phone,
            NEW.employee_id, split_part(COALESCE(NEW.full_name, ''), ' ', 1),
            NEW.full_name,
            NULLIF(regexp_replace(COALESCE(NEW.full_name, ''), '^\S+\s*', ''), ''),
            NEW.license_expiry_date, NEW.license_number, NEW.nic, NEW.phone,
            NEW.photo_url, COALESCE(NEW.status::text, 'ACTIVE')
        )
        ON CONFLICT (user_id) DO UPDATE SET
            updated_at = EXCLUDED.updated_at,
            address = EXCLUDED.address,
            department = EXCLUDED.department,
            designation = EXCLUDED.designation,
            email = EXCLUDED.email,
            emergency_contact_name = EXCLUDED.emergency_contact_name,
            emergency_contact_phone = EXCLUDED.emergency_contact_phone,
            employee_id = EXCLUDED.employee_id,
            first_name = EXCLUDED.first_name,
            full_name = EXCLUDED.full_name,
            last_name = EXCLUDED.last_name,
            license_expiry_date = EXCLUDED.license_expiry_date,
            license_number = EXCLUDED.license_number,
            nic = EXCLUDED.nic,
            phone = EXCLUDED.phone,
            photo_url = EXCLUDED.photo_url,
            status = EXCLUDED.status,
            version = drivers.version + 1;
    ELSIF TG_OP = 'UPDATE' AND OLD.role = 'DRIVER' THEN
        UPDATE drivers
        SET status = 'INACTIVE', updated_at = LOCALTIMESTAMP, version = version + 1
        WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER sync_driver_user
AFTER INSERT OR UPDATE OF role, address, department, designation, email,
    emergency_contact_name, emergency_contact_phone, employee_id, full_name,
    license_expiry_date, license_number, nic, phone, photo_url, status
ON users
FOR EACH ROW EXECUTE FUNCTION sync_driver_user_to_drivers();

DO $$
DECLARE
    mismatch TEXT;
BEGIN
    SELECT string_agg(e.resource_name || ': expected=' || e.row_count || ', actual=' || a.row_count, '; ')
    INTO mismatch
    FROM driver_consolidation_expected e
    JOIN (VALUES
        ('licenses', (SELECT COUNT(*) FROM driver_licenses)),
        ('certifications', (SELECT COUNT(*) FROM driver_certifications)),
        ('documents', (SELECT COUNT(*) FROM driver_documents)),
        ('infractions', (SELECT COUNT(*) FROM driver_infractions)),
        ('leaves', (SELECT COUNT(*) FROM driver_leaves)),
        ('performance_scores', (SELECT COUNT(*) FROM driver_performance_scores)),
        ('readiness', (SELECT COUNT(*) FROM driver_readiness_cache))
    ) AS a(resource_name, row_count) ON a.resource_name = e.resource_name
    WHERE a.row_count <> e.row_count;

    IF mismatch IS NOT NULL THEN
        RAISE EXCEPTION 'Driver consolidation validation failed: %', mismatch;
    END IF;
END;
$$;
