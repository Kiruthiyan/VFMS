# VFMS Project - Professional File Structure

## 📁 Project Organization

### **Frontend Structure** (`frontend/src/`)

```
src/
├── app/                          # Next.js 13+ App Router
│   ├── page.tsx                 # Landing page (public)
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   │
│   ├── auth/                    # 🔐 Authentication routes (PUBLIC)
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-email/
│   │
│   ├── dashboards/              # 📊 Role-based dashboards (PROTECTED)
│   │   ├── layout.tsx           # Shared dashboard wrapper
│   │   │
│   │   ├── admin/               # 👨‍💼 Admin Dashboard
│   │   │   ├── layout.tsx       # Admin-specific layout + RoleGuard
│   │   │   └── page.tsx         # Admin dashboard page
│   │   │
│   │   ├── driver/              # 🚗 Driver Dashboard
│   │   │   ├── layout.tsx       # Driver-specific layout + RoleGuard
│   │   │   └── page.tsx         # Driver dashboard page
│   │   │
│   │   ├── approver/            # ✅ Approver Dashboard
│   │   │   ├── layout.tsx       # Approver-specific layout + RoleGuard
│   │   │   └── page.tsx         # Approver dashboard page
│   │   │
│   │   ├── staff/               # 👤 Staff Dashboard
│   │   │   ├── layout.tsx       # Staff-specific layout + RoleGuard
│   │   │   └── page.tsx         # Staff dashboard page
│   │   │
│   │   └── shared-components/   # 🔄 Shared dashboard utilities
│   │       ├── sidebar.tsx      # Sidebar navigation (role-specific)
│   │       └── header.tsx       # Dashboard header component
│   │
│   ├── settings/                # ⚙️ User settings
│   │   ├── layout.tsx
│   │   └── change-password/
│   │
│   ├── unauthorized/            # 🚫 Access denied page
│   │ └── page.tsx
│   │
│   └── favicon.ico
│
├── components/                  # React components
│   ├── auth/                   # Authentication components
│   │   ├── split-screen-layout.tsx
│   │   ├── professional-login-form.tsx
│   │   ├── multi-step-signup-form.tsx
│   │   ├── role-guard.tsx
│   │   └── ...
│   │
│   ├── ui/                     # Reusable UI components
│   │   ├── button.tsx
│   │   ├── form-message.tsx
│   │   ├── loading-spinner.tsx
│   │   └── ...
│   │
│   ├── forms/                  # Form components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── ...
│   │
│   ├── settings/               # Settings components
│   │   └── change-password-form.tsx
│   │
│   ├── providers/              # Context/Provider components
│   │   └── ToastProvider.tsx
│   │
│   └── placeholders/           # Placeholder components
│       └── admin-dashboard-placeholder.tsx
│
├── lib/                        # Utility functions
│   ├── api.ts                 # Axios instance
│   ├── auth.ts                # Auth utilities
│   ├── rbac.ts                # Role-based access control
│   ├── utils.ts               # General utilities
│   │
│   ├── api/
│   │   └── auth.ts            # Auth API endpoints
│   │
│   └── validators/            # Zod validation schemas
│       └── auth/
│           ├── login-schema.ts
│           ├── register-schema.ts
│           ├── change-password-schema.ts
│           └── ...
│
└── store/                     # State management (Zustand)
    └── auth-store.ts         # Authentication state store
```

### **Backend Structure** (`backend/src/main/java/com/vfms/`)

```
src/
├── main/
│   ├── java/
│   │   └── com/vfms/
│   │       ├── VfmsApplication.java       # Main application class
│   │       │
│   │       ├── auth/                      # 🔐 Authentication module
│   │       │   ├── controller/
│   │       │   │   ├── AuthController.java
│   │       │   │   └── PasswordController.java
│   │       │   ├── service/
│   │       │   │   ├── AuthService.java
│   │       │   │   ├── PasswordService.java
│   │       │   │   ├── EmailService.java
│   │       │   │   └── RefreshTokenService.java
│   │       │   ├── dto/
│   │       │   │   ├── LoginRequest.java
│   │       │   │   ├── RegisterRequest.java
│   │       │   │   ├── AuthResponse.java
│   │       │   │   ├── ChangePasswordRequest.java
│   │       │   │   ├── ForgotPasswordRequest.java
│   │       │   │   ├── ResetPasswordRequest.java
│   │       │   │   ├── RefreshTokenRequest.java
│   │       │   │   └── ResendVerificationRequest.java
│   │       │   ├── entity/
│   │       │   │   ├── EmailVerificationToken.java
│   │       │   │   ├── PasswordResetToken.java
│   │       │   │   └── RefreshToken.java
│   │       │   └── repository/
│   │       │       ├── EmailVerificationTokenRepository.java
│   │       │       ├── PasswordResetTokenRepository.java
│   │       │       └── RefreshTokenRepository.java
│   │       │
│   │       ├── user/                      # 👥 User module
│   │       │   ├── entity/
│   │       │   │   └── User.java          # Core user entity
│   │       │   └── repository/
│   │       │       └── UserRepository.java
│   │       │
│   │       ├── config/                    # ⚙️ Configuration
│   │       │   ├── SecurityConfig.java    # Spring Security configuration
│   │       │   └── AsyncConfig.java       # Async configuration
│   │       │
│   │       ├── security/                  # 🔒 Security layer
│   │       │   ├── JwtService.java        # JWT token handling
│   │       │   ├── JwtAuthenticationFilter.java
│   │       │   └── CustomUserDetailsService.java
│   │       │
│   │       └── common/                    # 🔄 Common utilities
│   │           ├── dto/
│   │           │   ├── ApiResponse.java
│   │           │   └── ErrorResponse.java
│   │           ├── enums/
│   │           │   ├── Role.java          # User roles: ADMIN, DRIVER, APPROVER, STAFF
│   │           │   └── UserStatus.java    # User status: ACTIVE, INACTIVE, SUSPENDED
│   │           └── exception/
│   │               └── GlobalExceptionHandler.java  # ✅ Centralized exception handling
│   │
│   └── resources/
│       ├── application.properties
│       └── application-dev.properties
│
└── test/
    └── java/com/vfms/...               # Unit & Integration tests
```

---

## 🎯 Key Improvements

### **Backend Cleanup**
✅ Deleted duplicate `SecurityConfig.java` (was in `/config/` directory)
✅ Deleted misspelled `exeception/` directory (now using correct `exception/`)
✅ Centralized exception handling in `common/exception/`

### **Frontend Professional Organization**
✅ **Consolidated all dashboards** into single `dashboards/` folder
✅ **Role-based structure**: Each role has its own layout + page
  - `dashboards/admin/` → Admin Dashboard
  - `dashboards/driver/` → Driver Dashboard
  - `dashboards/approver/` → Approver Dashboard
  - `dashboards/staff/` → Staff Dashboard
✅ **Shared components**: `dashboards/shared-components/` for reusable dashboard utilities
✅ **Clean separation**: Auth (public) vs Dashboards (protected)
✅ **Added `.gitignore`** entry for `dev.log`

---

## 🔐 Access Control

### Frontend Route Protection
All dashboard routes are protected by `RoleGuard` component:

```
/dashboards/admin     → Requires ADMIN role
/dashboards/driver    → Requires DRIVER role
/dashboards/approver  → Requires APPROVER role
/dashboards/staff     → Requires STAFF role
```

### Backend Role-Based Access
Implemented via Spring Security + JWT:
```
Role.ADMIN    → Full system access
Role.DRIVER   → Vehicle & fuel management
Role.APPROVER → Request approval authority
Role.STAFF    → Basic fuel request submission
```

---

## 📝 File Naming Conventions

### React/Next.js Files
- **Page components**: `page.tsx` (Next.js convention)
- **Layout components**: `layout.tsx` (Next.js convention)
- **Component files**: `kebab-case.tsx` (e.g., `split-screen-layout.tsx`)
- **Utility files**: `kebab-case.ts` (e.g., `auth-store.ts`)
- **Validation schemas**: `kebab-case-schema.ts`

### Java Files
- **Classes**: `PascalCase.java`
- **Main app**: `VfmsApplication.java`
- **Entities**: `PascalCase.java` (e.g., `User.java`, `EmailVerificationToken.java`)
- **DTOs**: `PascalCase.java` (e.g., `LoginRequest.java`)
- **Services**: `PascalCase.java` (e.g., `AuthService.java`)
- **Repositories**: `PascalCase.java` (e.g., `UserRepository.java`)

---

## 🚀 Navigation Flow

### Public Routes
```
/ (Landing Page)
├── /auth/login
├── /auth/signup
├── /auth/forgot-password
├── /auth/reset-password
└── /auth/verify-email
```

### Protected Routes (Role-Based)
```
/dashboards/
├── /admin/          (ADMIN only)
├── /driver/         (DRIVER only)
├── /approver/       (APPROVER only)
└── /staff/          (STAFF only)

/settings/
└── /change-password

/unauthorized       (Error page)
```

---

## 💾 Database Entities

### User Entity
Located: `backend/src/main/java/com/vfms/user/entity/User.java`

**Common Fields**:
- username, email, password (hashed)
- fullName, phone, nic
- role (ADMIN, DRIVER, APPROVER, STAFF)
- status (ACTIVE, INACTIVE, SUSPENDED)
- emailVerified flag
- Timestamps (createdAt, updatedAt)

**Driver-Specific Fields**:
- licenseNumber, licenseExpiryDate
- certifications, experienceYears

**Staff-Specific Fields**:
- employeeId, department
- officeLocation, designation, approvalLevel

### Token Entities
- `EmailVerificationToken` → Email verification flow
- `PasswordResetToken` → Password reset flow
- `RefreshToken` → JWT refresh mechanism

---

## 📊 Project Statistics

### Frontend Components
- **Pages**: 10 (root + auth + dashboards + settings)
- **Components**: 15+ (auth, ui, forms, providers, placeholders)
- **Utilities**: 7 (api, auth, rbac, validators, store)
- **Animations**: 15+ CSS animations (slide, fade, glow, shake, bounce)

### Backend Endpoints
- **Auth**: Register, Login, Verify Email, Refresh Token
- **Password**: Forgot Password, Reset Password, Change Password
- **User**: Get Profile, Update Profile
- **Dashboard**: Role-specific data retrieval

---

## ✨ Code Quality Standards

### Frontend
- ✅ TypeScript strict mode enabled
- ✅ ESLint configured
- ✅ Tailwind CSS for styling
- ✅ Zod for runtime validation
- ✅ React Hook Form for forms
- ✅ Zustand for state management
- ✅ Professional animations with Framer Motion

### Backend
- ✅ Spring Boot 2.x with Spring Security
- ✅ JPA/Hibernate ORM
- ✅ Lombok for boilerplate reduction
- ✅ Custom exception handling
- ✅ JWT authentication
- ✅ Centralized error responses
- ✅ Maven for dependency management

---

## 🔄 Recent Cleanup Operations

**Deleted**:
- ❌ `/backend/src/main/java/config/SecurityConfig.java` (misplaced)
- ❌ `/backend/src/main/java/com/vfms/common/exeception/` (misspelled)
- ❌ `/frontend/src/app/admin/` (moved to dashboards/admin)
- ❌ `/frontend/src/app/approvals/` (moved to dashboards/approver)
- ❌ `/frontend/src/app/driver/` (moved to dashboards/driver)
- ❌ `/frontend/src/app/dashboard/` (moved to dashboards/staff)

**Created**:
- ✅ `/frontend/src/app/dashboards/` (master dashboard folder)
- ✅ `/frontend/src/app/dashboards/admin/`
- ✅ `/frontend/src/app/dashboards/driver/`
- ✅ `/frontend/src/app/dashboards/approver/`
- ✅ `/frontend/src/app/dashboards/staff/`
- ✅ `/frontend/src/app/dashboards/shared-components/`

---

## 🎓 Development Notes

### Next Steps for Developers
1. Implement actual dashboard UIs in respective role folders
2. Connect shared-components (sidebar.tsx, header.tsx) to main pages
3. Implement backend endpoints for each role
4. Add role-specific UI logic and features
5. Test role-based access control thoroughly
6. Add unit and integration tests

### Common Development URLs (Local)
```
Frontend:  http://localhost:3000
Backend:   http://localhost:8080

API Base:  http://localhost:8080/api
Auth:      /api/auth/login, /api/auth/register, etc.
```

---

**Last Updated**: March 25, 2026
**Status**: ✅ Professional restructuring complete
**Next Phase**: Feature implementation for each dashboard
