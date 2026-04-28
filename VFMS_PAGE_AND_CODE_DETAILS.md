# VFMS Page and Code Details

This file is a page-by-page and module-by-module code map for your VFMS project.
It is written from the current codebase so you can explain:

- what each page does
- which frontend files build that page
- which API functions are used
- which backend endpoints handle the request
- which backend classes contain the main logic

This guide focuses on your contribution areas:

1. User Authentication
2. User Management
3. Fuel Management

---

## 1. Project Structure Overview

### Frontend stack used in your code
- Next.js App Router
- React
- TypeScript
- Zustand
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Vitest

### Backend stack used in your code
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Maven
- H2 and PostgreSQL-ready configuration

### Main architecture pattern
- `page.tsx` files define routes/screens
- components build the UI for each route
- `src/lib/api/*.ts` files call backend endpoints
- backend controllers receive HTTP requests
- backend services apply business logic
- repositories query the database
- entities map Java objects to database tables
- DTOs define request and response shapes

### Shared frontend files you should know
- `frontend/src/lib/api.ts`
  - shared Axios instance
  - adds `Authorization: Bearer <token>`
  - auto-refreshes token on `401`
- `frontend/src/store/auth-store.ts`
  - stores current user, access token, refresh token
  - persisted with Zustand
- `frontend/src/lib/auth.ts`
  - shared auth types and role redirects
- `frontend/src/lib/rbac.ts`
  - role-to-route mapping for frontend access checks
- `frontend/src/components/auth/role-guard.tsx`
  - redirects wrong users away from protected pages

### Shared backend files you should know
- `backend/src/main/java/com/vfms/security/SecurityConfig.java`
  - global security rules
- `backend/src/main/java/com/vfms/security/JwtAuthenticationFilter.java`
  - reads JWT from request header
- `backend/src/main/java/com/vfms/security/JwtService.java`
  - creates and validates JWT
- `backend/src/main/java/com/vfms/common/exception/GlobalExceptionHandler.java`
  - centralized error handling

---

## 2. Authentication Pages and Code Details

### Route: `/auth/login`

### Main page file
- `frontend/src/app/auth/login/page.tsx`

### UI files used
- `frontend/src/components/layout/auth-shell.tsx`
- `frontend/src/components/forms/login-form.tsx`

### What this page does
- shows the sign-in screen
- collects email and password
- submits login request
- stores tokens and user data after success
- redirects the user to the correct dashboard by role

### Frontend API and state files used
- `frontend/src/lib/api/auth.ts`
  - `loginApi()`
- `frontend/src/store/auth-store.ts`
  - stores auth response
- `frontend/src/lib/auth.ts`
  - role redirect mapping

### Backend endpoint used
- `POST /api/auth/login`

### Backend files involved
- `backend/src/main/java/com/vfms/auth/controller/AuthController.java`
- `backend/src/main/java/com/vfms/auth/service/AuthService.java`
- `backend/src/main/java/com/vfms/security/CustomUserDetailsService.java`
- `backend/src/main/java/com/vfms/security/JwtService.java`
- `backend/src/main/java/com/vfms/auth/service/RefreshTokenService.java`
- `backend/src/main/java/com/vfms/user/repository/UserRepository.java`

### Important code logic
- email is normalized to lowercase
- backend checks account status before allowing login
- backend authenticates password with Spring Security
- JWT access token is generated
- refresh token is created and saved
- frontend stores returned auth data in Zustand

### Good explanation in review
- "This page is only the UI entry point. The real login rules are in `AuthService.login()`, where status checks, password checks, JWT generation, and refresh token creation happen."

---

### Route: `/auth/signup`

### Main page file
- `frontend/src/app/auth/signup/page.tsx`

### UI files used
- `frontend/src/components/layout/auth-shell.tsx`
- `frontend/src/components/forms/signup-form.tsx`

### What this page does
- handles self-registration
- supports only `DRIVER` and `SYSTEM_USER`
- runs a multi-step signup flow
- uses OTP verification before registration
- collects different fields depending on selected role

### Frontend API and validation files used
- `frontend/src/lib/api/auth.ts`
  - `sendOTPApi()`
  - `verifyOTPApi()`
  - `signupApi()`
- `frontend/src/lib/validators/auth/signup-schema.ts`
- other auth validators used by the step flow

### Backend endpoints used
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/register`

### Backend files involved
- `backend/src/main/java/com/vfms/auth/controller/AuthController.java`
- `backend/src/main/java/com/vfms/auth/service/OtpService.java`
- `backend/src/main/java/com/vfms/auth/service/AuthService.java`
- `backend/src/main/java/com/vfms/auth/dto/RegisterRequest.java`
- `backend/src/main/java/com/vfms/user/entity/User.java`

### Important code logic
- OTP is sent to email and verified before full registration
- backend only allows self-registration for `DRIVER` and `SYSTEM_USER`
- driver registration requires driver fields like license information
- staff registration requires staff fields like department and office location
- new self-registered accounts are saved as `EMAIL_UNVERIFIED`
- verification email is sent after registration

### Good explanation in review
- "The signup page has more frontend logic because it is step-based, but the final enforcement still happens in `AuthService.register()`."

---

### Route: `/auth/verify-email`

### Main page file
- `frontend/src/app/auth/verify-email/page.tsx`

### UI files used
- `frontend/src/components/layout/auth-shell.tsx`
- `frontend/src/components/auth/verify-email-card.tsx`

### What this page does
- reads the email verification token from query params
- sends it to the backend
- shows success, expired, invalid, or no-token state
- allows resend verification email if needed

### Frontend API files used
- `frontend/src/lib/api.ts`
  - direct API call for verify-email
- `frontend/src/lib/api/auth.ts`
  - `resendVerificationApi()`

### Backend endpoints used
- `POST /api/auth/verify-email?token=...`
- `POST /api/auth/resend-verification`

### Backend files involved
- `backend/src/main/java/com/vfms/auth/service/AuthService.java`
- `backend/src/main/java/com/vfms/auth/entity/EmailVerificationToken.java`
- `backend/src/main/java/com/vfms/auth/repository/EmailVerificationTokenRepository.java`

### Important code logic
- valid token changes user status from `EMAIL_UNVERIFIED` to `PENDING_APPROVAL`
- expired token shows resend UI
- invalid token also shows resend UI

### Good explanation in review
- "Email verification does not activate the account fully. It only proves email ownership and moves the user into admin approval state."

---

### Route: `/auth/forgot-password`

### Main page file
- `frontend/src/app/auth/forgot-password/page.tsx`

### UI files used
- `frontend/src/components/auth/forgot-password-form.tsx`
- `frontend/src/components/layout/auth-shell.tsx`

### What this page does
- collects email
- requests password reset instructions
- always shows a safe user-friendly message after submit

### Frontend API file used
- `frontend/src/lib/api/auth.ts`
  - `forgotPasswordApi()`

### Backend endpoint used
- `POST /api/auth/forgot-password`

### Backend files involved
- `backend/src/main/java/com/vfms/auth/controller/PasswordController.java`
- `backend/src/main/java/com/vfms/auth/service/PasswordService.java`
- `backend/src/main/java/com/vfms/auth/entity/PasswordResetToken.java`
- `backend/src/main/java/com/vfms/auth/repository/PasswordResetTokenRepository.java`

### Important code logic
- backend avoids email enumeration
- only valid approved accounts should get reset handling
- frontend shows success-style feedback even when account existence is not exposed

---

### Route: `/auth/reset-password`

### Main page file
- `frontend/src/app/auth/reset-password/page.tsx`

### UI files used
- `frontend/src/components/auth/reset-password-form.tsx`
- `frontend/src/components/layout/auth-shell.tsx`

### What this page does
- reads reset token from query params
- validates new password and confirm password
- submits reset request
- shows success state after password reset

### Frontend API and validation files used
- `frontend/src/lib/api/auth.ts`
  - `resetPasswordApi()`
- reset password validator files

### Backend endpoint used
- `POST /api/auth/reset-password`

### Backend files involved
- `backend/src/main/java/com/vfms/auth/controller/PasswordController.java`
- `backend/src/main/java/com/vfms/auth/service/PasswordService.java`

### Important code logic
- token must exist and not be expired
- new password must pass validation
- confirm password must match

---

### Route: `/settings/change-password`

### Main page file
- `frontend/src/app/settings/change-password/page.tsx`

### UI files used
- `frontend/src/components/layout/authorized-shell.tsx`
- `frontend/src/components/settings/change-password-form.tsx`

### What this page does
- allows logged-in user to change current password
- requires current password and new password

### Frontend API used
- auth API file change password function

### Backend endpoint used
- `POST /api/user/change-password`

### Backend files involved
- `backend/src/main/java/com/vfms/auth/controller/PasswordController.java`
- `backend/src/main/java/com/vfms/auth/service/PasswordService.java`
- `backend/src/main/java/com/vfms/security/SecurityContextProvider.java`

### Important code logic
- backend checks current password first
- new password cannot be same as current password

---

## 3. User Management Pages and Code Details

### Route: `/admin/users`

### Main page file
- `frontend/src/app/admin/users/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- `frontend/src/components/ui/page-header.tsx`
- `frontend/src/components/admin/users/create-user-dialog.tsx`
- `frontend/src/components/admin/users/user-role-badge.tsx`
- `frontend/src/components/admin/users/user-status-badge.tsx`

### What this page does
- acts as the user management dashboard
- loads summary counts
- shows quick links to all users, pending users, and deleted users
- opens create user dialog

### Frontend API files used
- `frontend/src/lib/api/admin.ts`
  - `getAllUsersApi()`
  - `getUserCountsApi()`

### Backend endpoints used
- `GET /api/admin/users`
- `GET /api/admin/users/counts`

### Backend files involved
- `backend/src/main/java/com/vfms/admin/controller/AdminUserController.java`
- `backend/src/main/java/com/vfms/admin/service/AdminUserService.java`

### Important code logic
- page is admin-only
- counts are built in backend and displayed in summary cards
- recent users and role summary are prepared in the page logic

---

### Route: `/admin/users/all`

### Main page file
- `frontend/src/app/admin/users/all/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- `frontend/src/components/admin/users/user-table.tsx`
- `frontend/src/components/admin/users/create-user-dialog.tsx`
- `frontend/src/components/ui/page-header.tsx`

### What this page does
- shows the full user directory
- supports search by name, email, or NIC
- filters by role and status
- paginates results in the frontend
- opens create user dialog
- delegates row actions to `UserTable`

### Frontend API files used
- `frontend/src/lib/api/admin.ts`
  - `getAllUsersApi()`
  - `getUserCountsApi()`

### Row actions handled in `UserTable`
- review pending user
- edit approved or deactivated user
- toggle status
- soft delete user
- restore user when needed
- expand row to show role-specific details

### Backend endpoints used
- `GET /api/admin/users`
- `GET /api/admin/users/counts`
- row actions use:
  - `POST /api/admin/users/{userId}/review`
  - `PUT /api/admin/users/{userId}`
  - `PATCH /api/admin/users/{userId}/toggle-status`
  - `PATCH /api/admin/users/{userId}/soft-delete`
  - `POST /api/admin/users/{userId}/restore`

### Backend files involved
- `backend/src/main/java/com/vfms/admin/controller/AdminUserController.java`
- `backend/src/main/java/com/vfms/admin/service/AdminUserService.java`
- `backend/src/main/java/com/vfms/admin/dto/CreateUserRequest.java`
- `backend/src/main/java/com/vfms/admin/dto/UpdateUserRequest.java`
- `backend/src/main/java/com/vfms/admin/dto/ReviewUserRequest.java`
- `backend/src/main/java/com/vfms/admin/dto/SoftDeleteRequest.java`
- `backend/src/main/java/com/vfms/admin/dto/UserSummaryResponse.java`
- `backend/src/main/java/com/vfms/user/entity/User.java`
- `backend/src/main/java/com/vfms/user/repository/UserRepository.java`

### Important code logic
- filtering is done client-side after data load
- soft delete does not permanently remove the user
- user table renders extra fields depending on user role
- admin-created users are marked visually

### Good explanation in review
- "This page is mainly a management UI over the admin user endpoints. The business rules like approval, restore, soft delete, and status transitions are handled in `AdminUserService`."

---

### Route: `/admin/users/pending`

### Main page file
- `frontend/src/app/admin/users/pending/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- `frontend/src/components/admin/users/user-table.tsx`

### What this page does
- shows only pending users
- enables review actions

### Frontend API files used
- `frontend/src/lib/api/admin.ts`
  - `getPendingUsersApi()`

### Backend endpoint used
- `GET /api/admin/users/pending`

### Backend files involved
- `backend/src/main/java/com/vfms/admin/controller/AdminUserController.java`
- `backend/src/main/java/com/vfms/admin/service/AdminUserService.java`

### Important code logic
- `UserTable` is reused with `showReviewActions=true`
- approval and rejection are done through the review dialog

---

### Route: `/admin/users/deleted`

### Main page file
- `frontend/src/app/admin/users/deleted/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- `frontend/src/components/admin/users/user-table.tsx`

### What this page does
- shows soft-deleted users
- explains that deleted users are retained for audit
- allows restore action

### Frontend API files used
- `frontend/src/lib/api/admin.ts`
  - `getDeletedUsersApi()`
  - `restoreUserApi()`

### Backend endpoints used
- `GET /api/admin/users/deleted`
- `POST /api/admin/users/{userId}/restore`

### Backend files involved
- `backend/src/main/java/com/vfms/admin/service/AdminUserService.java`

### Important code logic
- deleted users keep audit data like deleted time and deleted reason
- restore brings back previous status using saved metadata

---

## 4. Fuel Management Pages and Code Details

### Route: `/admin/fuel`

### Main page file
- `frontend/src/app/admin/fuel/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- `frontend/src/components/ui/page-header.tsx`

### What this page does
- acts as the fuel dashboard
- loads all fuel records
- calculates summary values in the page
- links to logs, create, and alerts pages

### Frontend API files used
- `frontend/src/lib/api/fuel.ts`
  - `getAllFuelRecordsApi()`
  - `extractUniqVehicles()`
  - `extractUniqueDrivers()`

### Backend endpoint used
- `GET /api/v1/fuel`

### Backend files involved
- `backend/src/main/java/com/vfms/fuel/controller/FuelController.java`
- `backend/src/main/java/com/vfms/fuel/service/FuelService.java`
- `backend/src/main/java/com/vfms/fuel/repository/FuelRecordRepository.java`

### Important code logic
- total spend, total volume, average cost, and active vehicle counts are computed in the frontend from fetched records

---

### Route: `/admin/fuel/create`

### Main page file
- `frontend/src/app/admin/fuel/create/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- `frontend/src/components/fuel/fuel-entry-form.tsx`

### What this page does
- loads vehicle and driver metadata first
- renders the fuel entry form
- redirects back to fuel dashboard after success

### Frontend API files used
- `frontend/src/lib/api/fuel.ts`
  - `getFuelFormMetadataApi()`

### Important form file
- `frontend/src/components/fuel/fuel-entry-form.tsx`

### What `FuelEntryForm` does
- validates with Zod
- uses React Hook Form
- collects vehicle, optional driver, date, quantity, cost per litre, odometer, station, notes
- supports optional receipt file
- validates file type and file size
- creates `FormData`
- sends JSON as `data` part and file as `receipt`
- shows warning if backend flags misuse

### Backend endpoints used
- `GET /api/v1/fuel/metadata`
- `POST /api/v1/fuel`

### Backend files involved
- `backend/src/main/java/com/vfms/fuel/controller/FuelController.java`
- `backend/src/main/java/com/vfms/fuel/service/FuelService.java`
- `backend/src/main/java/com/vfms/fuel/service/FuelStorageService.java`
- `backend/src/main/java/com/vfms/fuel/service/FuelMisuseService.java`
- `backend/src/main/java/com/vfms/fuel/dto/CreateFuelRecordRequest.java`
- `backend/src/main/java/com/vfms/fuel/dto/FuelFormMetadataResponse.java`
- `backend/src/main/java/com/vfms/fuel/dto/FuelLookupOptionResponse.java`
- `backend/src/main/java/com/vfms/vehicle/repository/VehicleRepository.java`
- `backend/src/main/java/com/vfms/driver/repository/DriverRepository.java`

### Important code logic
- backend parses `vehicleId` from string to `Long`
- backend validates vehicle exists
- driver is optional
- backend calculates `totalCost`
- backend uploads receipt if provided
- backend checks misuse before final save
- backend updates the vehicle odometer after saving

### Good explanation in review
- "The create page only prepares metadata and renders the form. The most important business logic is in `FuelService.createFuelRecord()`."

---

### Route: `/admin/fuel/logs`

### Main page file
- `frontend/src/app/admin/fuel/logs/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- `frontend/src/components/fuel/fuel-filter-bar.tsx`
- `frontend/src/components/fuel/fuel-records-table.tsx`

### What this page does
- loads all fuel records initially
- extracts unique vehicle and driver filters from the loaded records
- allows filtering by date range and optional vehicle/driver
- shows all fuel records in table form

### Frontend API files used
- `frontend/src/lib/api/fuel.ts`
  - `getAllFuelRecordsApi()`
  - `getFilteredFuelRecordsApi()`
  - `searchFuelRecordsApi()`
  - `extractUniqVehicles()`
  - `extractUniqueDrivers()`

### Backend endpoints used
- `GET /api/v1/fuel`
- `GET /api/v1/fuel/search`

### Backend files involved
- `backend/src/main/java/com/vfms/fuel/controller/FuelController.java`
- `backend/src/main/java/com/vfms/fuel/service/FuelService.java`
- `backend/src/main/java/com/vfms/fuel/repository/FuelRecordRepository.java`

### Important code logic
- search requires `from` and `to`
- backend chooses query path:
  - vehicle + date range
  - driver + date range
  - only date range
- search response includes efficiency values from backend response mapping

---

### Route: `/admin/fuel/alerts`

### Main page file
- `frontend/src/app/admin/fuel/alerts/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- table and badge UI components

### What this page does
- fetches all fuel records
- creates alert objects in the frontend
- shows suspicious patterns like:
  - excessive refueling
  - unusual quantity
  - suspicious mileage
  - abnormal consumption
  - off-pattern timing

### Frontend API files used
- `frontend/src/lib/api/fuel.ts`
  - `getAllFuelRecordsApi()`

### Backend endpoint used
- `GET /api/v1/fuel`

### Important code logic
- this page is not using a dedicated backend alerts endpoint
- alerts are generated in the page from record analysis
- review and resolve state are kept in page state, not persisted in backend

### Very important review note
- "Fuel Alerts is frontend-generated analytics, but Flagged Records is backend flag data."

---

### Route: `/admin/fuel/alerts/flagged`

### Main page file
- `frontend/src/app/admin/fuel/alerts/flagged/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- shared table and badge components

### What this page does
- loads only backend-flagged records
- shows flag reasons
- allows unflag action

### Frontend API files used
- `frontend/src/lib/api/fuel.ts`
  - `getFlaggedFuelRecordsApi()`
  - `unflagFuelRecordApi()`

### Backend endpoints used
- `GET /api/v1/fuel/flagged`
- `PATCH /api/v1/fuel/{id}/unflag`

### Backend files involved
- `backend/src/main/java/com/vfms/fuel/controller/FuelController.java`
- `backend/src/main/java/com/vfms/fuel/service/FuelService.java`

### Important code logic
- unflag clears `flaggedForMisuse`
- unflag also clears `flagReason`

---

### Route: `/admin/fuel/[id]`

### Main page file
- `frontend/src/app/admin/fuel/[id]/page.tsx`

### UI files used
- `frontend/src/components/layout/admin-shell.tsx`
- card, badge, and loading UI components

### What this page does
- reads route `id`
- fetches one fuel record
- displays record details for audit and review
- shows receipt link if available

### Frontend API files used
- `frontend/src/lib/api/fuel.ts`
  - `getFuelRecordByIdApi()`

### Backend endpoint used
- `GET /api/v1/fuel/{id}`

### Backend files involved
- `backend/src/main/java/com/vfms/fuel/controller/FuelController.java`
- `backend/src/main/java/com/vfms/fuel/service/FuelService.java`

### Important code logic
- page shows flagged vs verified state using badge logic
- detailed fields include vehicle, driver, date, station, quantity, cost, odometer, notes, receipt, creator, and timestamps

---

## 5. Frontend Shared Layout and Access Files

### `frontend/src/components/layout/auth-shell.tsx`
- shared layout for login, signup, verify-email, forgot-password, and reset-password
- keeps authentication pages visually consistent

### `frontend/src/components/layout/admin-shell.tsx`
- shared layout for all admin pages
- controls admin sidebar, top area, and navigation

### `frontend/src/components/layout/authorized-shell.tsx`
- generic protected page shell
- used for logged-in pages like change password

### `frontend/src/components/auth/role-guard.tsx`
- checks if user is logged in
- checks if user role matches the page
- redirects unauthorized users to login or their own dashboard

### `frontend/src/lib/api.ts`
- central request file for all modules
- adds JWT automatically
- tries refresh token flow on `401`
- clears auth and redirects to login if refresh fails

---

## 6. Backend File Map by Module

### Authentication backend files
- `auth/controller/AuthController.java`
  - public auth endpoints
- `auth/controller/PasswordController.java`
  - forgot, reset, and change password endpoints
- `auth/service/AuthService.java`
  - login, refresh, logout, register, verify email
- `auth/service/OtpService.java`
  - OTP send and verify logic
- `auth/service/PasswordService.java`
  - password reset and password change logic
- `auth/service/RefreshTokenService.java`
  - refresh token create/find/delete logic
- `auth/service/EmailService.java`
  - verification and password-reset email sending
- `auth/entity/EmailVerificationToken.java`
- `auth/entity/OtpVerification.java`
- `auth/entity/PasswordResetToken.java`
- `auth/entity/RefreshToken.java`
- matching repositories for all token entities

### Security backend files
- `security/JwtService.java`
- `security/JwtAuthenticationFilter.java`
- `security/CustomUserDetailsService.java`
- `security/SecurityContextProvider.java`
- `security/SecurityConfig.java`
- `config/SecurityConfig.java`
  - note: your repo currently contains both `config/SecurityConfig.java` and `security/SecurityConfig.java`, so be ready to explain which one is active in package use

### User management backend files
- `admin/controller/AdminUserController.java`
  - admin-only user endpoints
- `admin/service/AdminUserService.java`
  - approval, rejection, create, update, delete, restore, status toggle
- DTO files under `admin/dto`
  - request and response contracts
- `user/entity/User.java`
  - user model and Spring Security user details
- `user/repository/UserRepository.java`
  - user queries
- `user/controller/UserController.java`
  - current user endpoint

### Fuel management backend files
- `fuel/controller/FuelController.java`
  - admin-only fuel endpoints
- `fuel/service/FuelService.java`
  - core fuel business logic
- `fuel/service/FuelMisuseService.java`
  - misuse rule checking
- `fuel/service/FuelStorageService.java`
  - receipt upload handling
- `fuel/client/VehicleApiClient.java`
  - tries real-time vehicle data lookup
- `fuel/entity/FuelRecord.java`
  - fuel table mapping
- `fuel/repository/FuelRecordRepository.java`
  - fuel queries
- `fuel/dto/*`
  - request and response DTOs for fuel endpoints
- `vehicle/entity/Vehicle.java`
- `vehicle/repository/VehicleRepository.java`
- `driver/entity/Driver.java`
- `driver/repository/DriverRepository.java`

---

## 7. Main Backend Endpoints for Your Modules

### Authentication
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/user/change-password`
- `GET /api/user/me`

### User Management
- `POST /api/admin/users`
- `GET /api/admin/users`
- `GET /api/admin/users/pending`
- `GET /api/admin/users/deleted`
- `GET /api/admin/users/counts`
- `GET /api/admin/users/{userId}`
- `POST /api/admin/users/{userId}/review`
- `PATCH /api/admin/users/{userId}/soft-delete`
- `POST /api/admin/users/{userId}/restore`
- `PATCH /api/admin/users/{userId}/toggle-status`
- `PUT /api/admin/users/{userId}`

### Fuel Management
- `POST /api/v1/fuel`
- `GET /api/v1/fuel`
- `GET /api/v1/fuel/metadata`
- `GET /api/v1/fuel/{id}`
- `GET /api/v1/fuel/{id}/with-vehicle-data`
- `GET /api/v1/fuel/realtime/all`
- `GET /api/v1/fuel/search`
- `GET /api/v1/fuel/vehicle/{vehicleId}`
- `GET /api/v1/fuel/vehicle/{vehicleId}/realtime`
- `GET /api/v1/fuel/driver/{driverId}`
- `GET /api/v1/fuel/flagged`
- `PUT /api/v1/fuel/{id}`
- `PATCH /api/v1/fuel/{id}`
- `PATCH /api/v1/fuel/{id}/flag`
- `PATCH /api/v1/fuel/{id}/unflag`
- `DELETE /api/v1/fuel/{id}`

---

## 8. Most Important Business Logic You Should Remember

### Authentication logic
- user login is blocked if:
  - email not verified
  - status is pending approval
  - status is rejected
  - status is deactivated
- self-registration is limited to `DRIVER` and `SYSTEM_USER`
- email verification changes status to `PENDING_APPROVAL`
- admin approval is required before real access
- refresh token supports seamless session renewal

### User management logic
- admin-created users are created differently from self-registered users
- pending users can be approved or rejected
- reject requires a reason
- soft delete stores deletion metadata and keeps audit history
- restore uses previous saved status
- toggle status supports approved and deactivated transition

### Fuel management logic
- fuel create uses multipart request
- vehicle must exist
- driver is optional
- total cost is computed in backend
- receipt upload is optional
- record can be auto-flagged for misuse
- vehicle odometer is updated after saving fuel record

### Fuel misuse logic from `FuelMisuseService`
- flag if quantity exceeds configured maximum litres per entry
- flag if same vehicle already reached max entries for that day
- flag if odometer goes backwards compared with previous record

---

## 9. Test Files Related to Your Modules

### Backend tests
- `backend/src/test/java/com/vfms/auth/service/AuthServiceTest.java`
- `backend/src/test/java/com/vfms/auth/service/PasswordServiceTest.java`
- `backend/src/test/java/com/vfms/admin/service/AdminUserServiceTest.java`
- `backend/src/test/java/com/vfms/fuel/service/FuelServiceTest.java`
- `backend/src/test/java/com/vfms/fuel/service/FuelMisuseServiceTest.java`
- `backend/src/test/java/com/vfms/common/exception/ExceptionHandlerTest.java`

### Frontend tests
- `frontend/src/__tests__/lib/api.test.ts`
- `frontend/src/__tests__/lib/auth-api.test.ts`
- `frontend/src/__tests__/lib/signup-schema.test.ts`
- `frontend/src/__tests__/store/auth-store.test.ts`

### Test commands
- backend: `cd backend` then `mvn test`
- frontend: `cd frontend` then `npm run test`
- frontend lint: `npm run lint`

---

## 10. Best Short Explanations for Review

### If asked "How do frontend and backend connect?"
- "Frontend pages call functions in `src/lib/api/*.ts`. Those functions call Spring Boot REST endpoints. The backend controller receives the request, the service applies business rules, the repository talks to the database, and the response comes back to the UI."

### If asked "Why use DTOs?"
- "DTOs keep the API clean, validate request data, and prevent exposing entity structure directly."

### If asked "Why use JWT?"
- "JWT gives stateless authentication for the API. The frontend sends the access token in the header, and the backend validates it in the JWT filter."

### If asked "How is role-based access handled?"
- "Backend protects endpoints with authentication and `@PreAuthorize`, and frontend also checks role with route mapping and role guard."

### If asked "How are fuel records flagged?"
- "They are flagged automatically by misuse rules in `FuelMisuseService` or manually by admin with the flag endpoint."

### If asked "What is the difference between Fuel Alerts and Flagged Records?"
- "Fuel Alerts is frontend analysis from fetched records. Flagged Records uses the real backend misuse flag stored on each record."

---

## 11. Suggested Use of This File

Use this file when you need to answer:

- which page uses which component
- which component calls which API
- which endpoint goes to which backend class
- where the main business rules are located
- which files belong to your three contribution modules

For fast revision, focus most on:

1. `AuthService.java`
2. `AdminUserService.java`
3. `FuelService.java`
4. `FuelMisuseService.java`
5. `frontend/src/lib/api.ts`
6. `frontend/src/lib/api/auth.ts`
7. `frontend/src/lib/api/admin.ts`
8. `frontend/src/lib/api/fuel.ts`
9. `frontend/src/components/forms/signup-form.tsx`
10. `frontend/src/components/admin/users/user-table.tsx`
11. `frontend/src/components/fuel/fuel-entry-form.tsx`
