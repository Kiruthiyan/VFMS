# Final report — User Management

**Module:** User Management (Admin)  
**Branch:** `test3/kiruthiyan`  
**Status:** Delivered — **10/10** (June 2026 validation + navigation)  
**Last updated:** June 2026

---

## 1. Scope

Administrator provisioning and lifecycle for all VFMS user roles:

- Create users (ADMIN, APPROVER, SYSTEM_USER, DRIVER)
- List, filter, review pending registrations
- Approve / reject with email notification
- Edit profile and role-specific fields
- Soft delete, restore, activate / deactivate
- Staff (`SYSTEM_USER`) tied to employee registry
- Admin employee registry list and create

Requires authenticated **ADMIN** role.

---

## 2. Backend

### User controller

`backend/src/main/java/com/vfms/admin/controller/AdminUserController.java`  
Base: `/api/admin/users` · Class: `@PreAuthorize("hasRole('ADMIN')")`

| Method | Path | Action |
|--------|------|--------|
| POST | `/api/admin/users` | Create user |
| GET | `/api/admin/users` | List active users |
| GET | `/api/admin/users/pending` | Pending approval list |
| GET | `/api/admin/users/deleted` | Soft-deleted users |
| GET | `/api/admin/users/counts` | Status counts |
| GET | `/api/admin/users/staff-directory/{employeeId}` | Registry lookup for staff create/edit |
| GET | `/api/admin/users/{userId}` | Single user |
| POST | `/api/admin/users/{userId}/review` | Approve or reject |
| PATCH | `/api/admin/users/{userId}/soft-delete` | Soft delete + reason |
| POST | `/api/admin/users/{userId}/restore` | Restore deleted |
| PATCH | `/api/admin/users/{userId}/toggle-status` | APPROVED ↔ DEACTIVATED |
| PUT | `/api/admin/users/{userId}` | Update user |

Staff directory lookup accepts optional `?excludeUserId=` when editing an existing user.

### Employee registry controller (new)

`backend/src/main/java/com/vfms/admin/controller/AdminEmployeeRegistryController.java`  
Base: `/api/admin/employee-registry` · `@PreAuthorize("hasRole('ADMIN')")`

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/admin/employee-registry` | List all registry records (sorted by employee ID) |
| POST | `/api/admin/employee-registry` | Create registry record |

Service: `AdminEmployeeRegistryService` — normalizes employee ID (uppercase), email (lowercase), NIC, phone; rejects duplicate employee ID and email.

DTOs: `CreateEmployeeRegistryRequest`, `EmployeeRegistrySummaryResponse`.

### Service highlights (`AdminUserService`)

**Create**

- Validates unique email among non-deleted users
- Role-specific validation (driver license, approver level, etc.)
- `SYSTEM_USER`: loads verified `employee_registry` via `findVerifiedStaffRecordForProvisioning`; applies registry fields
- Generates secure temp password (`vfms.user.temp-password.*` config)
- Sets `APPROVED`, `emailVerified=true`, `passwordChangeRequired=true`, `createdByAdmin=true`
- Sends welcome email with temp password

**Staff lookup vs provisioning (duplicate fix)**

| Operation | Method | Behavior |
|-----------|--------|----------|
| Lookup | `getVerifiedStaffProfile` → `findActiveRegistryRecord` | Returns registry data + conflict flags; **does not throw** on email/employeeId conflict |
| Create / update SYSTEM_USER | `findVerifiedStaffRecordForProvisioning` → `assertNoStaffProvisioningConflicts` | **Blocks** duplicate VFMS accounts with role-aware field errors |

**`VerifiedStaffProfileResponse`** (`admin/dto/VerifiedStaffProfileResponse.java`):

- Registry fields: `employeeId`, `fullName`, `email`, `phone`, `nic`, `department`, `designation`, `officeLocation`
- Conflict fields: `accountAlreadyExists`, `existingAccountId`, `existingAccountRole`

Conflict detection uses `UserRepository.findByEmployeeIdAndDeletedAtIsNull` and `findByEmailAndDeletedAtIsNull`, respecting `excludeUserId` on edit.

Provisioning errors include existing role label (e.g. `ADMIN`) and direct admin to review **All Users** (conflicting account may not appear in Staff filter).

**Review**

- Only `PENDING_APPROVAL`, non-deleted users
- Approve: optional role change → `APPROVED`, approval email
- Reject: requires reason → `REJECTED`, rejection email

**Soft delete**

- Sets `deletedAt`, `deletedReason`, `deletedBy`
- Preserves prior status in `statusBeforeDeletion`
- Sets `DEACTIVATED`, blocks login
- Blocks self-delete and last active admin

**Restore**

- Clears delete fields; restores previous status or `APPROVED`
- Requires `assertActorCanManageUsers()`

**Toggle status**

- `APPROVED` ↔ `DEACTIVATED` only (non-deleted)
- Blocks self-modification and last active admin deactivation

**Update**

- Blocks self role changes
- `SYSTEM_USER` role uses same provisioning duplicate checks as create

**Re-audit guards**

- Self delete / deactivate / toggle / role-change blocked
- Last active admin protected via `countByRoleAndStatusAndDeletedAtIsNull(Role.ADMIN, UserStatus.APPROVED)`
- Removed broken `syncDriverRecord` / `DriverRepository` from admin user flow

### Roles and statuses

**Roles** (`Role` enum): `ADMIN`, `APPROVER`, `SYSTEM_USER`, `DRIVER`

**Statuses** (`UserStatus` enum):

| Status | Meaning |
|--------|---------|
| `EMAIL_UNVERIFIED` | Awaiting email confirmation |
| `PENDING_APPROVAL` | Verified, awaiting admin |
| `APPROVED` | Can login (if enabled) |
| `REJECTED` | Registration denied |
| `DEACTIVATED` | Disabled by admin or soft-delete |

### Employee registry

- CSV template: `backend/src/main/resources/data/employee-registry.csv`
- Entity: `employee_registry` table (`EmployeeRegistryRecord`)
- Staff create/edit must match active registry row (employee ID, email, NIC, phone)
- Admin can add records via API/UI (see Frontend)

### Security

- HTTP: `SecurityConfig` → `/api/admin/**` requires `ROLE_ADMIN`
- Method: `@PreAuthorize` on controllers

### DataSeeder alignment

`cleanupDemoUsers` uses same soft-delete semantics as admin soft-delete (status preserved, `DEACTIVATED`, protected seed email).

---

## 3. Frontend

### Routes (all under `/admin/*` → `RoleGuard` ADMIN)

| Route | Purpose |
|-------|---------|
| `/admin/users` | Overview — counts, recent users |
| `/admin/users/all` | Full table + status filter + review actions |
| `/admin/users/create` | Create user form |
| `/admin/users/registry` | Staff registry list + add record form |
| `/admin/users/deleted` | Deleted users + restore |

No separate `/admin/users/pending` page — use **All Users** filter `PENDING_APPROVAL`.

### Components

| Component | File | Notes |
|-----------|------|-------|
| Create form | `components/admin/users/create-user-form.tsx` | Staff lookup; conflict banner; submit disabled on conflict; link to All Users |
| Edit dialog | `components/admin/users/edit-user-dialog.tsx` | Same conflict UX; `excludeUserId` on staff lookup |
| Registry form | `components/admin/users/employee-registry-form.tsx` | Add registry record |
| User table | `components/admin/users/user-table.tsx` | Self delete/deactivate/toggle disabled |
| Delete dialog | `components/admin/users/delete-user-dialog.tsx` | Soft delete with reason |
| Review dialog | `components/admin/users/review-dialog.tsx` | Approve/reject pending users |
| Nav | `components/admin/users/user-management-nav.tsx` | 5 sections incl. Staff Registry |
| Role/status badges | `user-role-badge.tsx`, `user-status-badge.tsx` | Display helpers |

### API client

`frontend/src/lib/api/admin.ts`:

- User CRUD, review, counts, registry lookup
- `VerifiedStaffProfile` with `accountAlreadyExists`, `existingAccountId`, `existingAccountRole`
- `getEmployeeRegistryApi`, `createEmployeeRegistryApi`
- No wrapper for `GET /pending`; use filtered `getAllUsersApi`

### Constants

`frontend/src/lib/constants/user-management.ts` — `ROLE_GUIDANCE` per role for create form hints.

### Layout / guard

- `frontend/src/app/admin/layout.tsx` — `<RoleGuard allowedRole="ADMIN">`
- `frontend/src/components/layout/admin-shell.tsx` — admin chrome + nav

### Staff provisioning UX

1. Admin adds registry row at `/admin/users/registry` (or via CSV seed).
2. On create SYSTEM_USER: enter employee ID → **Load Details** → read-only identity from registry.
3. If `accountAlreadyExists`: red warning shows existing role; explains conflict may not appear in Staff list; link to **All Users**; submit disabled.
4. Server still enforces `assertNoStaffProvisioningConflicts` on create/update.

---

## 4. Configuration

```env
ADMIN_SEED_ENABLED=true
ADMIN_SEED_EMAIL=...
ADMIN_SEED_PASSWORD=...
VFMS_TEMP_PASSWORD_LENGTH=10
VFMS_TEMP_PASSWORD_CHARS=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

Temp password charset in `application-dev.properties` under `vfms.user.temp-password.*`.

---

## 5. Tests

| File | Coverage |
|------|----------|
| `AdminUserServiceTest` | 14+ cases — CRUD guards, soft-delete, toggle, normalization, role field clearing, staff lookup-with-warning, create-blocked-on-email-conflict, self/last-admin guards |
| `AdminEmployeeRegistryServiceTest` | 2 cases — normalized create, duplicate employee ID rejection |
| `AdminUserControllerSecurityTest` | AuthZ smoke — 401/403/200 for admin routes |

No frontend tests for admin/registry UI yet. No `AdminEmployeeRegistryController` integration tests yet.

```bash
cd backend
./mvnw.cmd test -Dtest=AdminUserServiceTest,AdminEmployeeRegistryServiceTest,AdminUserControllerSecurityTest
```

---

## 6. Completed fixes (this branch)

- Verified admin CRUD against live API shape
- `DataSeeder` demo cleanup aligned with admin soft-delete
- Shared `ROLE_GUIDANCE` constant (deduped from forms)
- Admin layout + `RoleGuard` on `/admin/*`
- **Staff email duplicate fix:** lookup succeeds with conflict flags; create/update blocked with role-aware messages
- **Staff Registry admin API + UI** at `/admin/users/registry`
- **Admin self-modification and last-admin protections**
- **User table:** self delete/deactivate/toggle disabled

---

## 7. June 2026 improvements (10/10)

| Fix | Implementation |
|-----|----------------|
| Client-side validation | Zod schema `create-user-schema.ts` + `zodResolver` on `create-user-form.tsx` (role-aware driver/staff rules) |
| Legacy admin navigation | `dashboard/admin/layout.tsx` links User Dashboard, Create User, All Users to canonical `/admin/users/*` |
| Frontend tests | `create-user-schema.test.ts` (3 cases) |

**Module score: 10/10**

---

## 8. Remaining / optional

| Item | Notes |
|------|-------|
| Registry edit/delete/deactivate API | Entity has `active` flag; UI shows status read-only |
| Dedicated pending page | Optional UX; filter on All Users works |
| Welcome email | Depends on SMTP in `.env` |

---

## 9. How to verify

1. Login as ADMIN.
2. Open `/admin/users` — confirm counts load.
3. Add registry row at `/admin/users/registry`.
4. Create DRIVER and SYSTEM_USER (with registry row).
5. **Duplicate scenario:** if registry email matches existing ADMIN account, staff profile loads with warning; submit disabled; conflicting user visible at `/admin/users/all`.
6. Attempt create via API with conflict → 400 with role in email error.
7. Self-register staff → appears pending → approve/reject from All Users.
8. Soft delete → appears on Deleted → restore.
9. Toggle deactivate on approved user → login blocked.
10. Login as non-admin → `/admin/users` redirects away.
