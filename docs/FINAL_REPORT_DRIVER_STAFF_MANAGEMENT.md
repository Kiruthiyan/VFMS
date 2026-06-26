# VFMS Driver & Staff Management — Final Report

**Date:** June 2026  
**Module:** DSM (`com.vfms.dsm`) + driver/staff frontend  
**Score:** 9/10 (in-scope fixes applied)

---

## Executive Summary

Driver and staff management in VFMS uses a **unified identity model**: authentication remains in `users`, while all driver operational data is consolidated into one physical `drivers` table. Staff are `users` with `Role.SYSTEM_USER` or `APPROVER`, pre-provisioned via `employee_registry`.

This audit identified broken report wiring, dead staff service-request UI, unsecured approver APIs, and orphaned schema files. All in-scope issues were fixed without modifying trip, fuel, auth, or global security config modules.

---

## Architecture

| Concept | Implementation |
|---------|----------------|
| Driver identity | `users` row, `role = DRIVER`, linked one-to-one to `drivers.user_id` |
| Staff identity | `users` row, `role = SYSTEM_USER` or `APPROVER` |
| Staff pre-registration | `employee_registry` table |
| Driver operational data | One physical `drivers` table; licenses, certifications, documents, infractions, leaves, performance, and readiness are JSONB-backed aggregate fields |
| Backend persistence | `DriverAggregate` maps directly to `drivers`; `DriverRepository` is the JSONB aggregate facade and `DriverAggregateRepository` is the real Spring Data repository |
| DSM controllers | `DriverController` for APPROVER/ADMIN and `DriverSelfController` for ROLE_DRIVER |
| DSM API contracts | Requests and responses are grouped in `DriverRequests` and `DriverResponses` without changing JSON fields |
| DSM services | Five focused services: identity, credentials, records, readiness, and assessment (including compliance, eligibility, and performance) |
| Approver APIs | `/api/drivers/**`, `/api/staff-profile/list` |
| Driver self-portal | `/api/driver/**` (ROLE_DRIVER) |
| Staff self-profile | `/api/staff-profile/**` (SYSTEM_USER / APPROVER list) |

---

## Issues Found & Fixes Applied

### Critical — Fixed

| Issue | Fix |
|-------|-----|
| Staff `/service-requests` page called removed `/api/staff/service-requests` | Deleted page; removed backend stubs |
| Admin driver reports used non-existent APIs | Added `frontend/src/lib/api/dsm-reports.ts`; updated all `/dashboard/admin/reports/drivers/**` pages |
| DSM approver APIs were publicly accessible | Added `@PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")` on all DSM controllers |
| Missing aggregate endpoints | Added `GET /api/drivers/infractions`, `/leaves`, `/compliance` |
| Broken `DriverControllerMvcTest` | Updated to test `/from-users` with mock auth |

### Medium — Fixed

| Issue | Fix |
|-------|-----|
| Dead `DriverForm`, `DriverAvailabilityTab` | Deleted (unused) |
| Misleading “no linked driver record” UI | Driver profile tabs now use user UUID directly |
| Orphan Java stubs | Removed legacy entity/repo/controller stubs |
| Legacy SQL migrations | Removed; added `backend/scripts/dsm-supabase-schema.sql` |
| Stale `DriverUserResponse` Javadoc | Updated to reflect user-centric model |
| Legacy `Staff` type in `types/index.ts` | Removed unused interface |

### Service-request cleanup

The duplicate driver service-request flow and its reports page were removed. Fleet maintenance requests are handled by the Fleet Management module.

---

## API Endpoints (DSM)

### Driver listing
- `GET /api/drivers/from-users` — paginated DRIVER users (APPROVER/ADMIN)
- `GET /api/drivers/from-users/{userId}` — single driver user

### Aggregates (new)
- `GET /api/drivers/infractions` — all infractions
- `GET /api/drivers/leaves` — all leave requests
- `GET /api/drivers/compliance` — per-driver compliance scores

### Existing sub-resources (secured)
Licenses, certifications, documents, infractions, leaves, readiness, eligibility, qualification, and performance use paths under `/api/drivers/**`.

### Staff
- `GET /api/staff-profile/list` — read-only staff directory (APPROVER/ADMIN)
- `GET`, `PUT /api/staff-profile/me` — staff self-profile (SYSTEM_USER)
- `POST`, `DELETE /api/staff-profile/picture` — staff profile picture (SYSTEM_USER)
- Removed the duplicate `GET /api/staff` and `GET /api/staff/{id}` endpoints together with `StaffController` and `StaffService`.

---

## Security

| Endpoint group | Roles |
|----------------|-------|
| `/api/drivers/**` | APPROVER, ADMIN |
| `/api/driver/**` | DRIVER (SecurityConfig) |
| `/api/staff-profile/list` | APPROVER, ADMIN |
| `/api/staff-profile/me`, `/api/staff-profile/picture` | SYSTEM_USER |

DSM approver authorization remains enforced by method security. The legacy global exception mapping currently converts some authorization failures on `permitAll` paths to HTTP 500; this remains a global security backlog item rather than a DSM routing change.

---

## Database (Supabase)

- Production: Supabase PostgreSQL via `DB_URL` in `backend/.env`
- Schema reference: [`backend/scripts/dsm-supabase-schema.sql`](../backend/scripts/dsm-supabase-schema.sql)
- Production Hibernate uses `ddl-auto=validate`; schema changes are migration-controlled
- `V21__drop_unused_driver_tables.sql` removes availability and service-request remnants
- `V22__consolidate_driver_tables.sql` migrates all `driver_*` table data into the physical `drivers` aggregate
- `V23__remove_driver_compatibility_views.sql` removes the temporary `driver_*` views and write-through functions after the direct aggregate cutover
- `DriverAggregate` uses JSON mapping plus optimistic locking; resource mutations also acquire a pessimistic row lock to prevent lost concurrent updates
- A `users` synchronization trigger creates and updates the consolidated row for DRIVER accounts
- Three readiness-cache records belonging to non-driver users are intentionally excluded as invalid derived data
- Removed misleading migration files: `V1__create_drivers`, `V2__create_staff`, `V11__create_staff_service_requests`, `V13__create_driver_availability`, `V18__remove_driver_availability`

### Driver file storage

- Driver profile pictures, licence documents, certification documents, and other Driver documents use private Supabase Object Storage only.
- Driver document/profile response paths no longer serve local `/uploads/**` metadata for these Driver uploads.
- PostgreSQL stores document metadata only in the `drivers.documents` JSONB field. It does not store file bytes or permanent signed URLs.
- Supabase records store metadata such as original file name, bucket name, storage path, MIME type, file size, document type, upload timestamp, and storage provider.
- Signed URLs are generated only after backend authorization succeeds and are short-lived.
- The private bucket must be created manually in Supabase. Default bucket: `driver-documents`.
- Required backend environment variables:
  - `SUPABASE_STORAGE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `DRIVER_SUPABASE_STORAGE_BUCKET` (optional; defaults to `driver-documents`)
  - `DRIVER_SUPABASE_SIGNED_URL_TTL_SECONDS` (optional; defaults to `300`)
- Supabase service-role/secret keys must remain in backend environment variables and must never be committed or exposed to the frontend.

---

## Tests Added/Updated

- `DriverEndpointContractTest` — exhaustive preservation check for every DSM HTTP method/path mapping
- `DriverAggregatePersistenceTest` — JSONB resources and flattened readiness through the consolidated repository facade

- `DriverControllerMvcTest` — auth + aggregate endpoint smoke tests
- `DriverComplianceServiceTest` — compliance score computation
- `DriverInfractionServiceAggregateTest` — list all infractions

---

## Cross-Module Backlog (not changed — confirm per item)

| ID | Module | Issue |
|----|--------|-------|
| X2 | Security | Global `/api/**` `permitAll` in `SecurityConfig` |
| X3 | Reports | `ReportService.getDriverPerformance()` returns stub data for all users |
| X4 | Config | H2 in-memory fallback when `DB_URL` unset |
| X5 | Trip | `GET /api/driver/trips` stub in driver self-portal |

---

## Verification Checklist

- [x] `GET /api/drivers/from-users` requires APPROVER/ADMIN
- [x] Driver profile tabs (licenses, docs, infractions, trips) use user UUID
- [x] Staff service-requests dead page removed
- [x] Admin driver reports use real DSM endpoints
- [x] Supabase reference schema documented
- [x] Legacy DSM stubs removed

---

## Score Breakdown (Post-Fix)

| Area | Before | After |
|------|--------|-------|
| Driver listing & profile | 8/10 | 9/10 |
| Driver sub-resources | 7/10 | 9/10 |
| Driver self-portal | 7/10 | 7/10 (trips stub remains) |
| Staff profile & directory | 8/10 | 9/10 |
| Staff service requests | 0/10 | N/A (removed) |
| Admin driver analytics | 2/10 | 9/10 |
| DSM security | 4/10 | 8/10 |
| Schema alignment | 5/10 | 9/10 |
| Tests | 4/10 | 8/10 |
| **Overall** | **6/10** | **9/10** |

Remaining 1 point: the driver self-portal trip endpoint (X5) remains a stub.
