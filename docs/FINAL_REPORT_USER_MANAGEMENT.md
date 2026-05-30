# Final report — User Management

**Module:** User Management (Admin)  
**Branch:** `test3/kiruthiyan`  
**Status:** Delivered (admin CRUD + review flows working)

---

## 1. Scope

Administrator provisioning and lifecycle for all VFMS user roles:

- Create users (ADMIN, APPROVER, SYSTEM_USER, DRIVER)
- List, filter, review pending registrations
- Approve / reject with email notification
- Edit profile and role-specific fields
- Soft delete, restore, activate / deactivate
- Staff (`SYSTEM_USER`) tied to employee registry

Requires authenticated **ADMIN** role.

---

## 2. Backend

### Controller

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

### Service highlights (`AdminUserService`)

**Create**

- Validates unique email among non-deleted users
- Role-specific validation (driver license, approver level, etc.)
- `SYSTEM_USER`: loads verified `employee_registry` record; applies registry fields
- Generates secure temp password (`vfms.user.temp-password.*` config)
- Sets `APPROVED`, `emailVerified=true`, `passwordChangeRequired=true`, `createdByAdmin=true`
- Sends welcome email with temp password

**Review**

- Only `PENDING_APPROVAL`, non-deleted users
- Approve: optional role change → `APPROVED`, approval email
- Reject: requires reason → `REJECTED`, rejection email

**Soft delete**

- Sets `deletedAt`, `deletedReason`, `deletedBy`
- Preserves prior status in `statusBeforeDeletion`
- Sets `DEACTIVATED`, blocks login

**Restore**

- Clears delete fields; restores previous status or `APPROVED`

**Toggle status**

- `APPROVED` ↔ `DEACTIVATED` only (non-deleted)

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
- Entity: `employee_registry` table
- Staff create/edit must match active registry row (employee ID, email, NIC, phone)

### Security

- HTTP: `SecurityConfig` → `/api/admin/**` requires `ROLE_ADMIN`
- Method: `@PreAuthorize` on controller

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
| `/admin/users/deleted` | Deleted users + restore |

No separate `/admin/users/pending` page — use **All Users** filter `PENDING_APPROVAL`.

### Components

| Component | File |
|-----------|------|
| Create form | `components/admin/users/create-user-form.tsx` |
| User table | `components/admin/users/user-table.tsx` |
| Edit dialog | `components/admin/users/edit-user-dialog.tsx` |
| Delete dialog | `components/admin/users/delete-user-dialog.tsx` |
| Review dialog | `components/admin/users/review-dialog.tsx` |
| Nav | `components/admin/users/user-management-nav.tsx` |
| Role/status badges | `user-role-badge.tsx`, `user-status-badge.tsx` |

### API client

`frontend/src/lib/api/admin.ts` — all CRUD + review + registry lookup (no wrapper for `GET /pending`; use filtered list).

### Constants

`frontend/src/lib/constants/user-management.ts` — `ROLE_GUIDANCE` per role for create form hints.

### Layout / guard

- `frontend/src/app/admin/layout.tsx` — `<RoleGuard allowedRole="ADMIN">`
- `frontend/src/components/layout/admin-shell.tsx` — admin chrome + nav

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

- `backend/src/test/java/com/vfms/admin/service/AdminUserServiceTest.java`

```bash
cd backend
./mvnw test -Dtest=AdminUserServiceTest
```

---

## 6. Completed fixes (this branch)

- Verified admin CRUD against live API shape
- `DataSeeder` demo cleanup aligned with admin soft-delete
- Shared `ROLE_GUIDANCE` constant (deduped from forms)
- Admin layout + `RoleGuard` on `/admin/*`

---

## 7. Remaining / optional

| Item | Notes |
|------|-------|
| Dedicated pending page | Optional UX; filter on All Users works |
| `GET /pending` API wrapper | Backend exists; frontend uses filtered `getAllUsersApi` |
| Employee registry data | Template CSV only — add real rows for staff signup/create |
| Welcome email | Depends on SMTP in `.env` |

---

## 8. How to verify

1. Login as ADMIN.
2. Open `/admin/users` — confirm counts load.
3. Create DRIVER and SYSTEM_USER (with registry row).
4. Self-register staff → appears pending → approve/reject from All Users.
5. Soft delete → appears on Deleted → restore.
6. Toggle deactivate on approved user → login blocked.
7. Login as non-admin → `/admin/users` redirects away.
