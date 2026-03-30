CREATE TABLE drivers (
    id                      BIGSERIAL PRIMARY KEY,
    employee_id             VARCHAR(50) UNIQUE NOT NULL,
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    nic                     VARCHAR(20) UNIQUE NOT NULL,
    date_of_birth           DATE,
    phone                   VARCHAR(20),
    email                   VARCHAR(150),
    address                 TEXT,
    emergency_contact_name  VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    department              VARCHAR(100),
    designation             VARCHAR(100),
    date_of_joining         DATE,
    photo_url               TEXT,
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                                CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_employee_id ON drivers(employee_id);
