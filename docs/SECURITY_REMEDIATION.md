# Security Remediation Status

## Completed

- Config files use environment variables (`${DB_URL}`, `${JWT_SECRET}`, etc.)
- `backend/.env` is gitignored; `backend/.env.example` uses placeholders only
- Auth, admin user, and fuel API paths scoped in `SecurityConfig`

## If secrets were ever committed

Rotate credentials immediately (Supabase DB password, Gmail app password, JWT secret, Supabase service key). Do not paste real values into tracked files.

### History purge (optional, team coordination required)

```bash
# Backup first, then use git filter-repo with a secrets replacement file.
# See: https://github.com/newren/git-filter-repo
```

After a force-push, collaborators should re-clone or hard-reset to the new history.

## Local setup (safe pattern)

```bash
cd backend
cp .env.example .env
# Edit .env locally — never commit this file
```

Required env vars: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, optional `MAIL_*`, `ADMIN_SEED_*`.

## Remaining production risks

- Legacy `/api/**` permitAll for non-auth modules (vehicles, trips, etc.)
- `DriverPerformanceService` uses placeholder scores (not real metrics)
