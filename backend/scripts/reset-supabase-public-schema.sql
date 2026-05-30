-- VFMS: wipe all application data in Supabase public schema.
-- Run once when you need a clean database. Hibernate recreates tables on next backend start (ddl-auto=update).
-- WARNING: irreversible — deletes all tables and data in public.

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Supabase extensions (safe to re-run)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
