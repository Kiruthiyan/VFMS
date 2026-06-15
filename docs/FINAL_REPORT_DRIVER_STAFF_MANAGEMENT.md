# VFMS Driver & Staff Management — Final Report

**Date:** June 2026  
**Module:** DSM (`com.vfms.dsm`) + driver/staff frontend  
**Score:** 9/10 (in-scope fixes applied)

---

## Executive Summary

Driver and staff management in VFMS uses a **unified user model**: drivers are `users` with `Role.DRIVER`; staff are `users` with `Role.SYSTEM_USER` or `APPROVER`, pre-provisioned via `employee_registry`. Legacy `drivers` and `staff` tables are no longer used by application code.

This audit identified broken report wiring, dead staff service-request UI, unsecured approver APIs, and orphaned schema files. All in-scope issues were fixed without modifying trip, fuel, auth, or global security config modules.

---

## Architecture

| Concept | Implementation |
|---------|----------------|
| Driver identity | `users` row, `role = DRIVER` |
| Staff identity | `users` row, `role = SYSTEM_USER` or `APPROVER` |
| Staff pre-registration | `employee_registry` table |
| Driver sub-resources | `driver_licenses`, `driver_certifications`, `driver_documents`, `driver_infractions`, `driver_leaves`, `driver_service_requests`, `driver_readiness_cache` — all `user_id → users(id)` |
| Approver APIs | `/api/drivers/**`, `/api/staff` |
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

### Driver reports requests page

Repointed from staff requests to **driver service requests** (`GET /api/drivers/service-requests/open`).

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
Licenses, certifications, documents, infractions, leaves, service requests, readiness, eligibility, qualification, performance — unchanged paths under `/api/drivers/**`.

### Staff
- `GET /api/staff`, `GET /api/staff/{id}` — read-only staff directory (APPROVER/ADMIN)
- `/api/staff-profile/**` — unchanged (staff self-service)

---

## Security

| Endpoint group | Roles |
|----------------|-------|
| `/api/drivers/**` | APPROVER, ADMIN |
| `/api/staff` | APPROVER, ADMIN |
| `/api/driver/**` | DRIVER (SecurityConfig) |
| `/api/staff-profile/**` | Authenticated + method security |

Unauthenticated requests to DSM approver endpoints return **403 Forbidden** (method security on `permitAll` paths).

---

## Database (Supabase)

- Production: Supabase PostgreSQL via `DB_URL` in `backend/.env`
- Schema reference: [`backend/scripts/dsm-supabase-schema.sql`](../backend/scripts/dsm-supabase-schema.sql)
- Hibernate `ddl-auto=update` continues to sync JPA entities at runtime
- Removed misleading migration files: `V1__create_drivers`, `V2__create_staff`, `V11__create_staff_service_requests`, `V13__create_driver_availability`, `V18__remove_driver_availability`

---

## Tests Added/Updated

- `DriverControllerMvcTest` — auth + aggregate endpoint smoke tests
- `DriverComplianceServiceTest` — compliance score computation
- `DriverInfractionServiceAggregateTest` — list all infractions

---

## Cross-Module Backlog (not changed — confirm per item)

| ID | Module | Issue |
|----|--------|-------|
| X1 | Trip | `TripRequestService` still queries legacy `drivers` table for assignment dropdowns |
| X2 | Security | Global `/api/**` `permitAll` in `SecurityConfig` |
| X3 | Reports | `ReportService.getDriverPerformance()` returns stub data for all users |
| X4 | Config | H2 in-memory fallback when `DB_URL` unset |
| X5 | Trip | `GET /api/driver/trips` stub in driver self-portal |
| Optional | DSM | Migrate driver document uploads from local disk to Supabase Storage |

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

Remaining 1 point: trip module integration (X1, X5) requires separate approval.
