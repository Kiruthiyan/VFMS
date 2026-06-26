-- The backend now maps DriverAggregate directly to the physical drivers table.
-- These views and write-through functions from V22 are no longer needed.

DROP VIEW IF EXISTS driver_licenses;
DROP VIEW IF EXISTS driver_certifications;
DROP VIEW IF EXISTS driver_documents;
DROP VIEW IF EXISTS driver_infractions;
DROP VIEW IF EXISTS driver_leaves;
DROP VIEW IF EXISTS driver_performance_scores;
DROP VIEW IF EXISTS driver_readiness_cache;

DROP FUNCTION IF EXISTS mutate_driver_json_collection();
DROP FUNCTION IF EXISTS mutate_driver_readiness();

DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO remaining_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'v', 'm')
      AND c.relname LIKE 'driver\_%' ESCAPE '\';

    IF remaining_count <> 0 THEN
        RAISE EXCEPTION 'Unexpected driver_* relations remain after compatibility cleanup: %', remaining_count;
    END IF;
END;
$$;
