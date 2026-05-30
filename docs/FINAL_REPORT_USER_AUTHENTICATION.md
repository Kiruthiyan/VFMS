# Final report — User Authentication

**Module:** User Authentication  
**Branch:** `test3/kiruthiyan`  
**Status:** Delivered (core flows working)

---

## 1. Scope

End-to-end authentication for VFMS:

- Login / logout / JWT refresh
- Staff self-registration (employee registry)
- Email verification and resend
- Forgot / reset / change password
- Session guards and role-based dashboard routing
- Optional admin seed on first startup

Out of scope: OTP-first signup (legacy endpoints remain), non-auth modules.

---

## 2. Backend

### Packages

| Area | Path |
|------|------|
| Controllers | `backend/src/main/java/com/vfms/auth/controller/` |
| Services | `backend/src/main/java/com/vfms/auth/service/` |
| Security | `backend/src/main/java/com/vfms/security/` |
| User profile | `backend/src/main/java/com/vfms/user/` |
| Admin seed | `backend/src/main/java/com/vfms/config/DataSeeder.java` |

### Public API (`permitAll`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Issue access + refresh tokens |
| POST | `/api/auth/refresh` | Rotate tokens |
| POST | `/api/auth/logout` | Invalidate refresh token |
| POST | `/api/auth/register` | Staff self-registration |
| POST | `/api/auth/staff/email-check` | Registry email eligibility |
| POST | `/api/auth/staff/verify` | Registry detail match |
| POST | `/api/auth/verify-email?token=` | Confirm email |
| POST | `/api/auth/resend-verification` | Resend verification link |
| POST | `/api/auth/forgot-password` | Start reset flow |
| POST | `/api/auth/reset-password` | Complete reset |
| POST | `/api/auth/send-otp` | Legacy OTP send |
| POST | `/api/auth/verify-otp` | Legacy OTP verify |

### Protected API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/user/me` | Current user profile |
| POST | `/api/user/change-password` | Logged-in password change |

### Token model

- **Access token:** JWT (HS256), subject = email, default TTL 24h (`JWT_EXPIRATION_MS`)
- **Refresh token:** UUID in DB, rotated on refresh, default TTL 7d (`JWT_REFRESH_EXPIRATION_MS`)
- **Secret:** `JWT_SECRET` in `backend/.env` only

### Password rules

- Minimum 8 characters, upper, lower, digit, special from `@$!%*?&`
- Admin-seeded and admin-created users: `passwordChangeRequired=true` until change

### Email flows

| Flow | Token TTL | Link base |
|------|-----------|-----------|
| Email verification | 24 hours | `{FRONTEND_URL}/auth/verify-email?token=` |
| Password reset | 1 hour | `{FRONTEND_URL}/auth/reset-password?token=` |

Requires `MAIL_USERNAME` / `MAIL_PASSWORD` in `.env`.

### Staff registration logic

1. Email must exist in `employee_registry` (active record).
2. NIC, phone, employee ID must match registry.
3. Only `SYSTEM_USER` role for self-signup.
4. After email verify: `SYSTEM_USER` → `APPROVED`; other roles → `PENDING_APPROVAL`.

### Admin seed (`DataSeeder`)

Enabled when `ADMIN_SEED_ENABLED=true` and all seed fields set. Creates one `ADMIN` if none exists. Optional `ADMIN_SEED_CLEANUP_DEMO_USERS=true` soft-deletes other active users.

### Login hardening

- Rejects users with `deletedAt != null` (`CustomUserDetailsService`, `AuthService`)
- Invalid credentials return generic message (no email enumeration on login)

---

## 3. Frontend

### Routes

| Route | Page |
|-------|------|
| `/auth/login` | Login |
| `/auth/signup` | 4-step staff signup |
| `/auth/verify-email` | Email verification |
| `/auth/forgot-password` | Request reset |
| `/auth/reset-password` | Set new password |
| `/auth/resend-verification` | Redirects → verify-email |
| `/settings/change-password` | Forced / voluntary change |
| `/login` | Legacy → `/auth/login` |
| `/dashboard/**` | Legacy → role dashboard or login |

### Key files

| File | Role |
|------|------|
| `frontend/src/store/auth-store.ts` | Zustand session (persisted) |
| `frontend/src/lib/api.ts` | Axios + Bearer + 401 refresh |
| `frontend/src/lib/api/auth.ts` | Auth API wrappers |
| `frontend/src/components/auth/role-guard.tsx` | Route protection |
| `frontend/src/lib/auth-session-routing.ts` | Status-based redirects |
| `frontend/src/lib/rbac.ts` | Role → dashboard paths |

### Session redirects

| Condition | Redirect |
|-----------|----------|
| Not logged in | `/auth/login` |
| `passwordChangeRequired` | `/settings/change-password` |
| `EMAIL_UNVERIFIED` | `/auth/verify-email` |
| `PENDING_APPROVAL` | Message / blocked dashboard |
| Wrong role | User's home dashboard |

### Dashboard homes

| Role | Path |
|------|------|
| ADMIN | `/dashboards/admin` |
| APPROVER | `/dashboards/approver` |
| SYSTEM_USER | `/dashboards/staff` |
| DRIVER | `/dashboards/driver` |

---

## 4. Configuration

```env
JWT_SECRET=...
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000,...
MAIL_USERNAME=...
MAIL_PASSWORD=...
OTP_VALIDITY_MINUTES=5
ADMIN_SEED_ENABLED=true
ADMIN_SEED_EMAIL=...
ADMIN_SEED_PASSWORD=...
```

---

## 5. Tests

### Backend

- `AuthControllerTest` — OTP validation
- `AuthServiceTest` — login, register, staff verify, email verify
- `PasswordServiceTest` — change password validation

```bash
cd backend
./mvnw test -Dtest=AuthControllerTest,AuthServiceTest,PasswordServiceTest
```

### Frontend

- `auth-store.test.ts`, `auth-api.test.ts`, `api.test.ts`, `signup-schema.test.ts`

```bash
cd frontend
npm test
```

---

## 6. Completed fixes (this branch)

- JWT injection + 401 refresh in `api.ts`
- Legacy `/dashboard/**` removed; catch-all redirect only
- Demo `RoleProvider` removed from root layout
- `passwordChangeRequired` enforced in login + guards
- Deleted-user login blocked
- Consolidated role redirect maps (`ROLE_HOME` in `rbac.ts`)
- Button `Slot` fix; Zod v4 + `@hookform/resolvers` v5 for forms

---

## 7. Remaining / optional

| Item | Notes |
|------|-------|
| Legacy OTP signup | Endpoints exist; signup UI uses registry flow |
| `/api/auth/logout` public | Works without Bearer; refresh cleared when authenticated |
| `/api/**` permitAll fallback | Other modules still open — see SECURITY_REMEDIATION.md |
| Email OTP copy vs config | Frontend `email-config.ts` still hardcodes 5 min text |

---

## 8. How to verify

1. Start backend with `backend/.env` (Supabase + JWT + seed).
2. Start frontend: `cd frontend && npm run dev`.
3. Login admin → forced password change if seeded.
4. Register staff with row in `employee-registry.csv` imported to DB.
5. Check email verification and admin approval path.
