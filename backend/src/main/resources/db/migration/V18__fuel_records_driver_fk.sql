-- Remove fuel records whose driver_id does not reference an existing driver.
DELETE FROM fuel_records fr
WHERE fr.driver_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM drivers d WHERE d.id = fr.driver_id);

-- Enforce referential integrity; clear driver when driver row is removed.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_fuel_records_driver_id'
    ) THEN
        ALTER TABLE fuel_records
            ADD CONSTRAINT fk_fuel_records_driver_id
            FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
    END IF;
END $$;
