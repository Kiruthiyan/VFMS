# Final report — Fuel Management

**Module:** Fuel Management  
**Branch:** `test3/kiruthiyan`  
**Status:** Delivered — backend complete; frontend partial (create, list, flag, unflag; no edit UI)  
**Last updated:** June 2026

---

## 1. Scope

Admin fuel entry tracking for fleet vehicles:

- Record fuel purchases (quantity, cost, odometer, vehicle, driver)
- Optional receipt upload to Supabase Storage
- Automatic misuse detection (quantity, daily limit, odometer)
- Manual flag / unflag
- Browse, filter, and view records
- Client-side alert heuristics (supplementary)

Requires authenticated **ADMIN** role.

---

## 2. Backend

### Controller

`backend/src/main/java/com/vfms/fuel/controller/FuelController.java`  
Base: `/api/v1/fuel` · `@PreAuthorize("hasRole('ADMIN')")`

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/fuel` | Create (multipart: `data` JSON + optional `receipt`) |
| GET | `/api/v1/fuel` | All records |
| GET | `/api/v1/fuel/metadata` | Vehicle/driver dropdown data |
| GET | `/api/v1/fuel/{id}` | Single record |
| GET | `/api/v1/fuel/{id}/with-vehicle-data` | Record + live vehicle API |
| GET | `/api/v1/fuel/search` | Date range + filters + efficiency fields |
| GET | `/api/v1/fuel/flagged` | Flagged records only |
| GET | `/api/v1/fuel/vehicle/{vehicleId}` | By vehicle |
| GET | `/api/v1/fuel/driver/{driverId}` | By driver |
| PUT | `/api/v1/fuel/{id}` | Full update |
| PATCH | `/api/v1/fuel/{id}` | Partial update |
| PATCH | `/api/v1/fuel/{id}/flag` | Manual flag |
| PATCH | `/api/v1/fuel/{id}/unflag` | Clear flag |
| DELETE | `/api/v1/fuel/{id}` | Delete record |

### Service logic (`FuelService`)

**Create / update validation**

- Vehicle must exist, active, status `AVAILABLE`
- Driver (if set) must exist as a **`User`** with `Role.DRIVER` and `UserStatus.APPROVED` (not deleted)
- Driver lookups use `UserRepository.findById`; metadata drivers from `UserRepository.findFuelMetadataDrivers()`
- Computes `totalCost = quantity × costPerLitre`
- Updates vehicle odometer when reading increases
- Runs misuse check on create and update (excludes current record ID on update)

**Misuse detection (`FuelMisuseService`)**

| Rule | Default config |
|------|----------------|
| Max litres per entry | `fuel.misuse.max-litres-per-entry=100` |
| Max entries per vehicle per day | `fuel.misuse.max-entries-per-day=3` |
| Odometer regression | Less than previous entry for same vehicle |

Config in `application-dev.properties`. Repository queries support `excludeRecordId` on update.

**Manual flags**

- Reason `"Manually flagged by admin"` preserved on re-evaluation
- Auto misuse re-check skipped when manual flag active

**Efficiency fields**

- Populated on `GET /search` responses (`efficiencyKmPerLitre`, `distanceSinceLast`)
- Not on plain `GET /` or `GET /{id}`

### Driver FK migration (`drivers` → `users`)

Legacy `fuel_records.driver_id` referenced a separate `drivers` table. Current implementation uses `users`:

| Layer | File | Change |
|-------|------|--------|
| Entity | `fuel/entity/FuelRecord.java` | `driver` → `User` via `driver_id` |
| Service | `fuel/service/FuelService.java` | `UserRepository`; `validateDriverEligibility()` |
| Metadata | `user/repository/UserRepository.java` | `findFuelMetadataDrivers()` — approved DRIVER users |
| SQL | `db/migration/V19__fuel_records_driver_user_fk.sql` | Drop old FK, clean orphans, add FK → `users(id) ON DELETE SET NULL` |
| Runtime | `config/FuelRecordsDriverFkMigration.java` | `ApplicationRunner` fallback for DBs still on old `drivers` FK |

**Schema note:** No Flyway in app config; dev uses Hibernate `ddl-auto=update` plus the runtime migration runner. On existing databases, restart backend and confirm migration logs before creating fuel entries.

### Receipt storage (Supabase)

| Env var | Purpose |
|---------|---------|
| `SUPABASE_STORAGE_URL` | Storage API base |
| `SUPABASE_STORAGE_BUCKET` | Default `fuel-receipts` |
| `SUPABASE_SERVICE_KEY` | Upload auth |

`FuelStorageService` uploads to `receipts/{uuid}_{filename}`. Throws if storage not configured.

### Security

- `SecurityConfig`: `/api/v1/fuel/**` → `hasRole("ADMIN")`
- Controller-level `@PreAuthorize` duplicate

### Entity

- Table: `fuel_records`
- UUID primary key; links to `Vehicle` and optional `User` driver

---

## 3. Frontend

### Routes (ADMIN via `/admin/layout.tsx`)

| Route | Purpose |
|-------|---------|
| `/admin/fuel` | Dashboard summary |
| `/admin/fuel/create` | New fuel entry |
| `/admin/fuel/logs` | Browse + filters |
| `/admin/fuel/alerts` | Client-side anomaly list |
| `/admin/fuel/alerts/flagged` | Backend flagged records + unflag |
| `/admin/fuel/[id]` | Read-only detail |

**Missing:** `/admin/fuel/[id]/edit` — no edit UI.

### Components

| Component | File |
|-----------|------|
| Entry form (create only) | `components/fuel/fuel-entry-form.tsx` |
| Records table | `components/fuel/fuel-records-table.tsx` |
| Filter bar | `components/fuel/fuel-filter-bar.tsx` |
| Flag badge | `components/fuel/fuel-flag-badge.tsx` |
| Summary cards | `components/fuel/fuel-summary-cards.tsx` — present but not wired to pages |

### API client

`frontend/src/lib/api/fuel.ts` — create, list, metadata, getById, search, flagged, update, patch, flag, unflag, delete.

**Used in pages:** create, list, metadata, getById, flagged, unflag, search/filter.

**Not used in UI:** update, patch, delete, flag (except unflag on flagged page).

### Validation

`frontend/src/lib/validators/fuel/fuel-entry-schema.ts` — Zod schema aligned with create form.

### Navigation

`frontend/src/lib/admin-navigation.ts` — Fuel Dashboard, Add Entry, Logs, Alerts, Flagged Records.

---

## 4. Configuration

```env
# Misuse rules (optional overrides)
# Set in application-dev.properties by default:
# fuel.misuse.max-litres-per-entry=100
# fuel.misuse.max-entries-per-day=3

# Receipt uploads
SUPABASE_STORAGE_URL=https://....supabase.co/storage/v1
SUPABASE_STORAGE_BUCKET=fuel-receipts
SUPABASE_SERVICE_KEY=...
```

---

## 5. Tests

| File | Coverage |
|------|----------|
| `FuelServiceTest` | 16 tests — create/patch/flag/delete, metadata, date range, driver via `UserRepository`, missing driver tolerance |
| `FuelMisuseServiceTest` | 4 tests — quantity, daily limit, odometer regression, clean pass |
| `FuelStorageServiceTest` | 3 tests — file size, MIME type, filename sanitization |
| `FuelControllerMvcTest` | 12 tests — 401/403 for unauth/non-admin; metadata, search validation, delete auth |

**Gaps:** no test for `FuelRecordsDriverFkMigration`; no driver-eligibility rejection test (non-DRIVER role).

```bash
cd backend
./mvnw.cmd test -Dtest=FuelServiceTest,FuelMisuseServiceTest,FuelStorageServiceTest,FuelControllerMvcTest
```

Frontend: `frontend/src/__tests__/lib/fuel-utils.test.ts`

---

## 6. Completed fixes (this branch)

- Misuse check excludes current record on update (no false daily-limit on edit)
- Manual flags preserved on update/re-eval
- Fuel create link in admin navigation
- `SecurityConfig` fuel paths require ADMIN
- `reportService` no longer hardcodes API URL (shared env helper)
- **`fuel-summary-cards.tsx`** present but unused (dashboard uses inline stats)
- **Driver FK repointed** from `drivers` → `users` (entity, service, V19 SQL, startup migration runner)
- **Expanded test suite** — `FuelStorageServiceTest`, `FuelControllerMvcTest`

---

## 7. Remaining gaps

| Gap | Impact |
|-----|--------|
| **No edit UI** | Admin cannot fix typos in UI; must use API |
| **No delete UI** | `deleteFuelRecordApi` unused |
| **No manual flag UI** | Only unflag on flagged page |
| **Detail page read-only** | No actions on `/admin/fuel/[id]` |
| **Efficiency N/A on dashboard** | List uses `GET /` without efficiency; use filtered search |
| **Alerts page client-only** | Not persisted; overlaps backend rules loosely |
| **Receipt not updatable** | Update endpoints don't accept new receipt file |
| **Supabase env loading** | Ensure all three storage vars in `.env` for uploads |
| **FK migration tests** | No automated test for `FuelRecordsDriverFkMigration` |
| **Driver eligibility tests** | No test rejecting non-DRIVER / non-APPROVED user as driver |
| **Legacy FK error** | `fk_fuel_records_driver_id` on old DBs — restart backend to run migration, then retry create |

---

## 8. How to verify

1. Login as ADMIN.
2. Confirm backend logs show `FuelRecordsDriverFkMigration` success on startup (if upgrading an existing DB).
3. `/admin/fuel/create` — select driver from metadata dropdown (sourced from approved DRIVER users in `users` table).
4. Submit entry; trigger misuse (e.g. >100 L) → flag warning.
5. `/admin/fuel/logs` — filter by date/vehicle.
6. `/admin/fuel/alerts/flagged` — see flagged rows; unflag one.
7. `/admin/fuel/{id}` — view detail.
8. Upload receipt (requires Supabase storage env).
9. Non-admin token → `403` on `/api/v1/fuel`.
10. If fuel create fails with driver FK error: restart backend, verify migration log, retry.

---

## 9. Future work (optional)

1. Add `/admin/fuel/[id]/edit` reusing `fuel-entry-form.tsx` with `updateFuelRecordApi`.
2. Delete + manual flag on detail page.
3. Use `GET /search` for dashboard to show efficiency.
4. Align alerts page with backend flagged API only.
5. Add integration test for driver FK migration and driver eligibility validation.
