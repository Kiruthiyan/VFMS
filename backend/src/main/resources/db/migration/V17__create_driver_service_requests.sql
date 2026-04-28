CREATE TABLE driver_service_requests (
    id           BIGSERIAL PRIMARY KEY,
    driver_id    UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_id   BIGINT,
    request_type VARCHAR(30) NOT NULL
                     CHECK (request_type IN ('FAULT_REPORT','SERVICE_REQUEST','INSPECTION_REQUEST')),
    description  TEXT NOT NULL,
    urgency      VARCHAR(10) NOT NULL DEFAULT 'MEDIUM'
                     CHECK (urgency IN ('LOW','MEDIUM','HIGH')),
    status       VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                     CHECK (status IN ('OPEN','ACKNOWLEDGED','IN_PROGRESS','RESOLVED')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_driver_service_req_driver_id ON driver_service_requests(driver_id);
CREATE INDEX idx_driver_service_req_status ON driver_service_requests(status);
CREATE INDEX idx_driver_service_req_urgency ON driver_service_requests(urgency);