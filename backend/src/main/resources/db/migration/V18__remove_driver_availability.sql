DROP TABLE IF EXISTS driver_availability_log;
DROP TABLE IF EXISTS driver_availability;

ALTER TABLE driver_readiness_cache DROP COLUMN IF EXISTS availability_status;
