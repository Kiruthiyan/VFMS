-- Spring executes schema.sql using the configured statement separator.
-- These PostgreSQL DO blocks must end with "@@" so inner semicolons are preserved.

-- Migration 1: Drop and recreate tables if vehicle IDs are UUID (incompatible with new bigint type)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicles'
          AND column_name = 'id'
          AND data_type = 'uuid'
    ) THEN
        DROP TABLE IF EXISTS fuel_records;
        DROP TABLE IF EXISTS vehicles;
    END IF;
END $$@@

-- Migration 2: Rename 'make' column to 'brand' if vehicles table already uses bigint IDs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicles' AND column_name = 'make'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicles' AND column_name = 'brand'
    ) THEN
        ALTER TABLE vehicles RENAME COLUMN make TO brand;
    END IF;
END $$@@

-- Migration 3: Align fuel_records.vehicle_id with bigint vehicle IDs when safe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vehicles'
          AND column_name = 'id'
          AND data_type = 'bigint'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'fuel_records'
          AND column_name = 'vehicle_id'
          AND data_type = 'uuid'
    ) THEN
        IF EXISTS (SELECT 1 FROM fuel_records LIMIT 1) THEN
            RAISE EXCEPTION
                'Cannot auto-migrate fuel_records.vehicle_id from uuid to bigint while fuel_records contains data.';
        END IF;

        ALTER TABLE fuel_records
            ALTER COLUMN vehicle_id TYPE bigint USING NULL;
    END IF;
END $$@@
