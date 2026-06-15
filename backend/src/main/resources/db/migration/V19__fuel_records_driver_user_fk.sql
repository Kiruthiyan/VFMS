-- Repoint fuel_records.driver_id from legacy drivers table to auth users table.

ALTER TABLE fuel_records DROP CONSTRAINT IF EXISTS fk_fuel_records_driver_id;

DELETE FROM fuel_records fr
WHERE fr.driver_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = fr.driver_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_fuel_records_driver_user_id'
    ) THEN
        ALTER TABLE fuel_records
            ADD CONSTRAINT fk_fuel_records_driver_user_id
            FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;
