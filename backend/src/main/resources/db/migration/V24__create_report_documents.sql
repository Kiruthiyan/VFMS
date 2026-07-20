CREATE TABLE report_documents (
    id                  BIGSERIAL PRIMARY KEY,
    file_name           VARCHAR(255) NOT NULL,
    original_file_name  VARCHAR(255) NOT NULL,
    bucket_name         VARCHAR(100) NOT NULL,
    storage_path        VARCHAR(255) NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,
    file_size           BIGINT NOT NULL,
    report_type         VARCHAR(50) NOT NULL,
    format              VARCHAR(10) NOT NULL,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_documents_type ON report_documents(report_type);
