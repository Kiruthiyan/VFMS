# Final report — User Authentication

**Module:** User Authentication  
**Branch:** `test3/kiruthiyan`  
**Status:** Delivered (core flows working; session hardening completed in re-audit)  
**Last updated:** June 2026

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
| Exception handling | `backend/src/main/java/com/vfms/common/exception/GlobalExceptionHandler.java` |

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

### Login and JWT hardening

- Rejects users with `deletedAt != null` (`CustomUserDetailsService`, `AuthService.validateLoginStatus`)
- Invalid credentials return generic message (no email enumeration on login)
- **`JwtAuthenticationFilter`:** returns early **401 JSON** for invalid/expired Bearer tokens, disabled/locked accounts, and user-load failures — no silent pass-through to unauthenticated handlers
- **`GlobalExceptionHandler`:** returns 400 for malformed UUID path parameters and missing required search parameters (shared with other modules)

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
| `frontend/src/store/auth-store.ts` | Zustand session (persisted); `syncSessionFromServer` on rehydrate |
| `frontend/src/lib/api.ts` | Axios + Bearer + 401 refresh queue |
| `frontend/src/lib/api/auth.ts` | Auth API wrappers + `AuthApiError` |
| `frontend/src/components/auth/role-guard.tsx` | Client route protection |
| `frontend/src/lib/auth-session-routing.ts` | Status-based redirects |
| `frontend/src/lib/rbac.ts` | Role → dashboard paths; `vfms-token` / `vfms-role` cookies |
| `frontend/src/lib/role-context.tsx` | Dashboard RBAC context (`isAdmin`, `canApprove`, etc.) |
| `frontend/src/lib/roleContext.tsx` | Trips module user context (auth-derived) |
| `frontend/src/components/providers/dashboard-role-provider.tsx` | Wraps `role-context` in dashboard layout |
| `frontend/src/proxy.ts` | Cookie-based edge guard logic (see Edge routing below) |

### Session store (`auth-store.ts`)

On Zustand rehydrate, `syncSessionFromServer()` calls `GET /api/user/me`:

- **Success:** updates user/role in store and refreshes cookies
- **401:** clears session via `clearAuth()`
- **Other errors (network/5xx):** marks `hydrated: true` but keeps persisted session

`isAuthenticated()` requires token **and** `status === "APPROVED"`.

Duplicate `authStore.ts` removed; all consumers use `auth-store.ts`.

### Role context and demo mode

- `role-context.tsx` — effective role from auth store; demo role override only when `NEXT_PUBLIC_ENABLE_DEMO_ROLE=true`
- `Topbar.tsx` — hides demo role picker when demo mode is disabled (production default)
- Trips pages use `roleContext.tsx` separately from dashboard RBAC

### Edge routing (`proxy.ts` vs middleware)

`frontend/src/proxy.ts` implements cookie checks for `/admin` and `/dashboards` (redirect to login when `vfms-token` missing; role mismatch redirect).

**There is no active `middleware.ts`** (only `middleware.ts.bak`). `proxy.ts` is not wired as Next.js middleware.

**Primary protection is client-side:** `role-guard.tsx` + `auth-session-routing.ts` + cookies set after login/`syncSessionFromServer`.

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

# Optional — dev/demo only
NEXT_PUBLIC_ENABLE_DEMO_ROLE=false
```

---

## 5. Tests

### Backend

| File | Coverage |
|------|----------|
| `AuthControllerTest` | Legacy OTP validation/normalization |
| `AuthServiceTest` | Login, register, staff verify, email auto-approve |
| `PasswordServiceTest` | Change-password validation |

No dedicated `JwtAuthenticationFilter` or `SecurityConfig` integration tests yet.

```bash
cd backend
./mvnw.cmd test -Dtest=AuthControllerTest,AuthServiceTest,PasswordServiceTest
```

### Frontend

| File | Coverage |
|------|----------|
| `src/__tests__/store/auth-store.test.ts` | setAuth, clearAuth, approval gate, `syncSessionFromServer` success + 401 (6 cases) |
| `src/__tests__/lib/auth-api.test.ts` | Login error mapping, signup field errors |
| `src/__tests__/lib/api.test.ts` | Interceptors, auth store integration |
| `src/__tests__/lib/signup-schema.test.ts` | Signup Zod validation |

```bash
cd frontend
npm test
```

---

## 6. Completed fixes (this branch)

| Fix | Detail |
|-----|--------|
| JWT injection + 401 refresh | `api.ts` single-flight refresh queue |
| Legacy `/dashboard/**` | Catch-all redirect only |
| Demo `RoleProvider` | Removed from root layout |
| `passwordChangeRequired` | Enforced in login + guards |
| Deleted-user login | Blocked at service and `UserDetailsService` layers |
| Role redirect maps | Consolidated `ROLE_HOME` in `rbac.ts` |
| Form stack | Button `Slot` fix; Zod v4 + `@hookform/resolvers` v5 |
| **Session sync bug** | `syncSessionFromServer` no longer calls `clearAuth()` after successful `/me` |
| **JWT 401 handling** | Invalid token returns JSON 401 before controller |
| **Demo role safety** | Env-gated demo role override in `role-context.tsx` |
| **Auth store tests** | Vitest coverage for hydration + 401 sync path |
| **Store consolidation** | Removed duplicate `authStore.ts` |

---

## 7. Remaining / optional

| Item | Notes |
|------|-------|
| Edge middleware not wired | `proxy.ts` exists but no active `middleware.ts`; direct URL access relies on client guards + cookies |
| Dual role contexts | `role-context.tsx` (dashboard RBAC) vs `roleContext.tsx` (trips) |
| Legacy OTP signup | Endpoints exist; signup UI uses registry flow |
| `/api/auth/logout` public | Works without Bearer; refresh cleared when authenticated |
| `/api/**` permitAll fallback | Vehicles, trips, maintenance, rental, etc. still open at HTTP layer |
| Email OTP copy vs config | Frontend may hardcode 5 min text while backend uses `OTP_VALIDITY_MINUTES` |
| `syncSessionFromServer` non-401 errors | Network/5xx keeps stale persisted session |

---

## 8. How to verify

1. Start backend with `backend/.env` (Supabase + JWT + seed).
2. Start frontend: `cd frontend && npm run dev`.
3. Login admin → forced password change if seeded.
4. Register staff with row in `employee_registry` (via admin registry UI or CSV import).
5. Check email verification and admin approval path.
6. **Rehydrate test:** login → hard refresh → session persists and `/me` refreshes user/role.
7. **Invalid token test:** corrupt or remove `vfms-token` cookie → API returns 401 and session clears on next sync.
