ALTER TABLE report_documents
    ADD COLUMN removed_from_history_at TIMESTAMPTZ;

CREATE INDEX idx_report_documents_visible_uploaded_at
    ON report_documents(uploaded_at DESC)
    WHERE removed_from_history_at IS NULL;
