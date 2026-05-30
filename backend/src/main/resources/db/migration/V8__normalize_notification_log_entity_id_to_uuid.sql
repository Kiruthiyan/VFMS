DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'notification_log'
          AND column_name = 'entity_id'
          AND udt_name = 'int8'
    ) THEN
        ALTER TABLE notification_log ADD COLUMN entity_id_uuid UUID;
        ALTER TABLE notification_log DROP COLUMN entity_id;
        ALTER TABLE notification_log RENAME COLUMN entity_id_uuid TO entity_id;
    END IF;
END $$;
