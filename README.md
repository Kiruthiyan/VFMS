# VFMS Project

Vehicle and Fuel Management System (VFMS) is a full-stack web application built to manage user access, administrative user operations, and fuel-record workflows in a role-based environment.

This repository contains:

- A Spring Boot backend for authentication, user administration, fuel services, validation, and security
- A Next.js frontend for login, dashboards, admin management views, and fuel management interfaces

## Student Contribution

**Student B - Kiruthiyan (23410B)**

Primary contribution areas:

- User Authentication Module
- User Management Module
- Fuel Management Module

## Contribution Summary

### 1. User Authentication Module

Implemented and integrated the complete authentication flow across backend and frontend, including:

- User registration
- Login with JWT-based authentication
- Refresh token flow
- Logout flow
- OTP send and verify flow
- Email verification and resend verification
- Forgot password and reset password flow
- Auth state persistence and route protection in the frontend

### 2. User Management Module

Implemented administrative user lifecycle management features, including:

- Admin-only user creation
- User approval and rejection workflow
- Active, pending, and deleted user listings
- Soft delete and restore flow
- User status toggling
- User detail update flow
- Role-aware user handling for admin, approver, staff/system users, and drivers

### 3. Fuel Management Module

Implemented and integrated core fuel record management features, including:

- Fuel record creation
- Fuel record listing and search
- Vehicle and driver linked fuel entries
- Flagging and unflagging suspicious records
- Fuel metadata support for frontend forms
- Fuel misuse rule enforcement and validation support

## Project Overview

The system is structured as a monorepo with separate frontend and backend applications.

### Backend responsibilities

- REST API development
- JWT security and role-based authorization
- DTO validation and centralized error handling
- User lifecycle business logic
- Fuel management business logic
- Database access via Spring Data JPA

### Frontend responsibilities

- Authentication screens and protected routing
- Dashboard navigation by role
- Admin user management interfaces
- Fuel management views and actions
- API integration with backend services

## Technology Stack

### Backend

- Java 21
- Spring Boot 3.3.4
- Spring Security
- Spring Data JPA
- Maven
- H2 database for development profile
- PostgreSQL-ready configuration for persistent environments

### Frontend

- Next.js 16
- React 19
- TypeScript
- Zustand
- Axios
- Tailwind CSS
- Vitest

## Main Modules

### User Authentication

Backend packages involved:

- `backend/src/main/java/com/vfms/auth`
- `backend/src/main/java/com/vfms/security`
- `backend/src/main/java/com/vfms/config`
- `backend/src/main/java/com/vfms/user/controller/UserController.java`

Frontend paths involved:

- `frontend/src/app/auth`
- `frontend/src/components/auth`
- `frontend/src/lib/api/auth.ts`
- `frontend/src/lib/auth.ts`
- `frontend/src/store/auth-store.ts`
- `frontend/src/components/auth/role-guard.tsx`

Key features:

- Register new users
- Login and token handling
- Refresh token support
- Logout support
- OTP generation and verification
- Email verification flow
- Password reset and password change
- Protected route handling based on auth state and role

### User Management

Backend packages involved:

- `backend/src/main/java/com/vfms/admin`
- `backend/src/main/java/com/vfms/user`
- `backend/src/main/java/com/vfms/common`

Frontend paths involved:

- `frontend/src/app/admin/users`
- `frontend/src/components/layout`
- `frontend/src/app/dashboards/shared-components`

Key features:

- Create users through admin flow
- Review pending users
- Approve or reject requests
- Soft delete and restore users
- Activate and deactivate users
- Update user details
- Retrieve user counts for management views

### Fuel Management

Backend packages involved:

- `backend/src/main/java/com/vfms/fuel`
- `backend/src/main/java/com/vfms/vehicle`
- `backend/src/main/java/com/vfms/driver`

Frontend paths involved:

- `frontend/src/app/admin/fuel`
- `frontend/src/components/fuel`
- `frontend/src/lib/api/fuel.ts`

Key features:

- Create fuel records with validation
- Retrieve and search fuel records
- View flagged fuel entries
- Flag and unflag suspicious records
- Load vehicle and driver metadata for forms
- Link fuel data to vehicle and driver context

## High-Level Architecture

```text
Frontend (Next.js + TypeScript)
    ->
Axios API client with auth header injection
    ->
Spring Boot REST API
    ->
Security layer (JWT + role checks)
    ->
Service layer
    ->
Repository layer
    ->
Database
```

## Project Structure

```text
VFMS/
|- backend/
|  |- src/main/java/com/vfms/
|  |  |- admin/
|  |  |- auth/
|  |  |- common/
|  |  |- config/
|  |  |- driver/
|  |  |- fuel/
|  |  |- security/
|  |  |- user/
|  |  |- vehicle/
|  |- src/main/resources/
|  |- pom.xml
|
|- frontend/
|  |- src/
|  |  |- app/
|  |  |- components/
|  |  |- lib/
|  |  |- store/
|  |  |- __tests__/
|  |- package.json
|
|- README.md
|- .gitignore
```

## Important API Areas

### Authentication APIs

Base route: `/api/auth`

Important endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

User self-service endpoint:

- `GET /api/user/me`
- `POST /api/user/change-password`

### User Management APIs

Base route: `/api/admin/users`

Important endpoints:

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

### Fuel Management APIs

Base route: `/api/v1/fuel`

Important endpoints:

- `POST /api/v1/fuel`
- `GET /api/v1/fuel`
- `GET /api/v1/fuel/metadata`
- `GET /api/v1/fuel/flagged`
- `GET /api/v1/fuel/search`
- `GET /api/v1/fuel/{id}`
- `GET /api/v1/fuel/vehicle/{vehicleId}`
- `GET /api/v1/fuel/driver/{driverId}`
- `PATCH /api/v1/fuel/{id}/flag`
- `PATCH /api/v1/fuel/{id}/unflag`
- `PUT /api/v1/fuel/{id}`
- `DELETE /api/v1/fuel/{id}`

## Security and Validation

The project includes:

- JWT-based authentication
- Role-based authorization using Spring Security
- Method-level access control for protected admin and fuel routes
- DTO validation on backend requests
- Frontend validation for key auth forms
- Centralized exception handling for consistent API error responses
- Configurable CORS origins

## Configuration

### Backend configuration

Main file:

- `backend/src/main/resources/application.properties`

Development profile:

- `backend/src/main/resources/application-dev.properties`

Common configuration areas:

- Server port
- Active Spring profile
- Database connection
- JWT secret and expiry
- Mail configuration
- CORS allowed origins
- Fuel misuse thresholds

### Frontend configuration

Common environment usage:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FRONTEND_URL`

The frontend currently targets the backend at:

- `http://localhost:8080`

## How to Run

### Backend

```bash
cd backend
mvn spring-boot:run
```

Default development behavior:

- Runs on `http://localhost:8080`
- Uses the `dev` Spring profile
- Uses H2 in-memory database from `application-dev.properties`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Default development behavior:

- Runs on `http://localhost:3000`
- Uses `NEXT_PUBLIC_API_URL=http://localhost:8080`

## Testing

### Backend tests

```bash
cd backend
mvn test
```

### Frontend tests

```bash
cd frontend
npm test
```

### Frontend production build

```bash
cd frontend
npm run build
```

## Code Quality and Assessment Alignment

This project has been organized to support strong academic assessment outcomes through:

- Consistent naming and formatting
- DTO-based validation
- Clear separation of controller, service, repository, entity, DTO, and config layers
- Centralized error handling
- Reduced hardcoded values by relying on configuration
- Cleaner API integration between frontend and backend
- Testable service and UI integration structure

## Notes for Submission or Demonstration

If you are presenting your contribution, focus on these three modules:

1. User Authentication
2. User Management
3. Fuel Management

Recommended demo flow:

1. Register or create a user
2. Verify email or complete login
3. Show role-based protected access
4. Review or manage users from admin pages
5. Create and view fuel records
6. Show flagged fuel handling

## Maintainer Information

Prepared for academic/project documentation with contribution emphasis on:

- **Student B - Kiruthiyan (23410B)**

