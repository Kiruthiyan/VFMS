CREATE TABLE staff (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     VARCHAR(50) UNIQUE NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    nic             VARCHAR(20) UNIQUE,
    email           VARCHAR(150),
    phone           VARCHAR(20),
    department      VARCHAR(100),
    designation     VARCHAR(100),
    date_of_joining DATE,
    role            VARCHAR(20) NOT NULL DEFAULT 'SYSTEM_USER'
                        CHECK (role IN ('SYSTEM_USER','APPROVER')),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_department ON staff(department);
