# FleetPro - Vehicle Fleet Management System (VFMS)

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.0-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue)
![Status](https://img.shields.io/badge/Build-Verified-success)

FleetPro is a full-stack Vehicle Fleet Management System (VFMS) designed to manage fleet operations, users, drivers, staff, vehicles, trips, fuel usage, rentals, maintenance, vendors, and operational reports from a centralized role-based platform.

The system uses a Spring Boot backend, a Next.js frontend, PostgreSQL for relational data, and Supabase Object Storage for secure private document handling. It is prepared for deployment with the frontend on Vercel and the backend on AWS.

## Table of Contents

- [Key Features](#key-features)
- [System Modules](#system-modules)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Build and Test Commands](#build-and-test-commands)
- [Deployment Guide](#deployment-guide)
- [Security Highlights](#security-highlights)
- [API Overview](#api-overview)
- [Documentation](#documentation)
- [Current Verification Status](#current-verification-status)
- [Recommended Production Checklist](#recommended-production-checklist)
- [License](#license)

## Key Features

- Secure JWT-based authentication with refresh tokens.
- Role-based dashboards for Admin, Approver, Staff, and Driver users.
- Employee registry based staff self-registration.
- Admin-controlled user creation, review, approval, deactivation, restoration, and deletion workflows.
- Vehicle registry with creation, update, retirement, odometer, and status management.
- Trip booking and scheduling with driver/vehicle assignment, lifecycle tracking, and conflict prevention.
- Fuel management with receipt uploads, cost calculations, misuse flagging, and driver/vehicle metadata.
- Maintenance workflow with requests, quotations, approvals, invoices, and closure.
- Rental vehicle workflow with vendors, agreements, invoices, return handling, and cost tracking.
- Driver and staff management with profile, license, certification, document, leave, infraction, readiness, and performance features.
- Reporting and analytics dashboards for operational and cost visibility.
- Private Supabase Object Storage integration with signed access URLs.
- Production-ready environment configuration for AWS and Vercel.

## System Modules

### 1. Authentication and Authorization

- Email/password login.
- JWT access tokens and refresh token flow.
- Email verification, OTP support, forgot password, reset password, and change password flows.
- Role-based access control enforced in backend security configuration and frontend route guards.
- Protected frontend routes through Next.js proxy middleware.

### 2. User Management

- Admin user management for all system users.
- Staff self-registration through verified employee registry records.
- Admin approval/rejection workflow for pending accounts.
- Soft delete, restore, deactivation, and lifecycle status handling.
- Staff directory and profile management.

### 3. Vehicle Management

- Vehicle creation, update, listing, detail view, and retirement.
- Plate number uniqueness validation.
- Vehicle status handling for available, retired, and maintenance states.
- Odometer tracking and fleet lookup support for other modules.

### 4. Maintenance Management

- Maintenance request creation and tracking.
- Quotation, estimated cost, approval, rejection, invoice upload, and closure workflow.
- Business validation to prevent duplicate open maintenance requests for the same vehicle.
- Supabase-backed secure storage for quotation and invoice documents.

### 5. Rental and Vendor Management

- Rental vehicle request and operational status workflow.
- Vendor creation, update, active/inactive handling, and operational selection.
- Agreement and invoice document upload using secure storage.
- Validation to prevent overlapping active rental periods for the same vehicle plate.

### 6. Trip Booking and Scheduling

- Trip request creation, editing, submission, approval, rejection, assignment, cancellation, and completion.
- Driver and vehicle double-booking prevention.
- Driver accept/reject/start/complete workflow.
- Sequential intermediate stop logging.
- Timeline deviation justification for early/late completion.
- Driver-specific and requester-specific access controls.
- Calendar and search views for operational planning.

### 7. Fuel Management

- Fuel record creation, update, patch, delete, and search.
- Vehicle and driver metadata lookup.
- Fuel cost calculation from quantity and cost per litre.
- Odometer update after fuel entry.
- Misuse detection and manual flag/unflag workflow.
- Fuel receipt upload to private Supabase storage with signed access URLs.

### 8. Driver and Staff Management

- Driver profile management.
- License, certification, document, profile picture, infraction, leave, readiness, and performance workflows.
- Driver self-service portal.
- Staff profile management and profile picture handling.
- Admin/Approver driver management interfaces.

### 9. Reporting and Analytics

- Admin reporting dashboard.
- Fuel, maintenance, rental, utilization, trip, and driver performance reports.
- Export support using Excel/PDF-related backend and frontend tooling.
- Secure report document storage.

## Technology Stack

### Frontend

| Area | Technology |
|------|------------|
| Framework | Next.js 16 |
| UI Runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Forms and Validation | React Hook Form, Zod |
| HTTP Client | Axios |
| Maps | Leaflet, OpenStreetMap services |
| Charts/Reports | Recharts, jsPDF, xlsx |
| Testing | Vitest |

### Backend

| Area | Technology |
|------|------------|
| Framework | Spring Boot 3.4.0 |
| Language | Java 21 |
| Security | Spring Security, JWT |
| Database | PostgreSQL / Supabase PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Storage | Supabase Object Storage |
| Email | Spring Mail |
| Build Tool | Maven Wrapper |
| Testing | JUnit, Spring Boot Test, Spring Security Test |

## Architecture

```text
User Browser
    |
    v
Next.js Frontend - Vercel
    |
    | HTTPS REST API calls
    v
Spring Boot Backend - AWS
    |
    | JDBC
    v
Supabase PostgreSQL
    |
    | Signed/private object access
    v
Supabase Object Storage
```

The frontend communicates with the backend through `NEXT_PUBLIC_API_URL`. The backend validates JWT tokens, applies role-based authorization, manages business logic, persists records in PostgreSQL, and generates secure document access links for private Supabase storage objects.

## Repository Structure

```text
VFMS/
+-- backend/                 # Spring Boot REST API
|   +-- src/main/java/com/vfms
|   |   +-- admin/           # Admin user and employee registry
|   |   +-- auth/            # Authentication and password flows
|   |   +-- common/          # Shared DTOs, exceptions, health endpoint
|   |   +-- config/          # Application configuration and seeders
|   |   +-- dsm/             # Driver and staff management
|   |   +-- fleet/           # Fleet document storage support
|   |   +-- fuel/            # Fuel management
|   |   +-- maintenance/     # Maintenance workflow
|   |   +-- rental/          # Rental and vendor management
|   |   +-- reports/         # Report storage and analytics support
|   |   +-- security/        # JWT and Spring Security configuration
|   |   +-- trip/            # Trip booking and scheduling
|   |   +-- vehicle/         # Vehicle registry
|   +-- src/main/resources
|       +-- application.properties
|       +-- application-dev.properties
|       +-- db/migration/
+-- frontend/                # Next.js application
|   +-- src/app              # App Router pages and layouts
|   +-- src/components       # Shared UI and feature components
|   +-- src/lib              # API clients, auth, helpers
|   +-- src/store            # Zustand stores
|   +-- src/__tests__        # Frontend tests
+-- docs/                    # Final reports and documentation
+-- README.md
```

## User Roles

| Role | Main Access |
|------|-------------|
| `ADMIN` | Full administration, users, fleet, fuel, reports, trips, drivers, vendors |
| `APPROVER` | Trip approvals, driver/staff review operations, fleet review workflows |
| `SYSTEM_USER` | Staff dashboard, trip requests, profile, allowed fleet views |
| `DRIVER` | Driver dashboard, assigned trips, driver profile, leave, documents |

Main dashboards:

| Role | Dashboard |
|------|-----------|
| Admin | `/dashboards/admin` |
| Approver | `/dashboards/approver` |
| Staff/System User | `/dashboards/staff` |
| Driver | `/dashboards/driver` |

## Getting Started

### Prerequisites

- Java 21
- Node.js 20 or later
- npm
- PostgreSQL database, preferably Supabase PostgreSQL
- Supabase project for private object storage
- SMTP account for email features

### Backend Setup

```bash
cd backend
cp .env.example .env
```

Update `backend/.env` with database, JWT, CORS, email, and Supabase values.

For local development, set:

```env
SPRING_PROFILES_ACTIVE=dev
```

Run the backend:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend default URL:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/health
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a local environment file if needed:

```bash
cp .env.example .env.local
```

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_DEMO_ROLE=false
```

Run the frontend:

```bash
npm run dev
```

Frontend default URL:

```text
http://localhost:3000
```

## Environment Configuration

### Backend Environment Variables

| Variable | Purpose |
|----------|---------|
| `SPRING_PROFILES_ACTIVE` | Runtime profile. Use `prod` for AWS and `dev` for local development. |
| `DB_URL` | PostgreSQL JDBC connection string. |
| `DB_USER` | Database username. |
| `DB_PASSWORD` | Database password. |
| `DB_DRIVER` | JDBC driver, usually `org.postgresql.Driver`. |
| `HIBERNATE_DIALECT` | Hibernate dialect, usually PostgreSQL dialect. |
| `JWT_SECRET` | Strong 32+ character JWT signing secret. |
| `JWT_EXPIRATION_MS` | Access token expiry in milliseconds. |
| `JWT_REFRESH_EXPIRATION_MS` | Refresh token expiry in milliseconds. |
| `FRONTEND_URL` | Public frontend URL. |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins. |
| `MAIL_HOST` | SMTP host. |
| `MAIL_PORT` | SMTP port. |
| `MAIL_USERNAME` | SMTP username. |
| `MAIL_PASSWORD` | SMTP password/app password. |
| `SUPABASE_STORAGE_URL` | Supabase storage API URL. |
| `SUPABASE_SERVICE_KEY` | Supabase service role key. Keep private. |
| `SUPABASE_STORAGE_BUCKET` | Fuel receipt bucket. |
| `DRIVER_SUPABASE_STORAGE_BUCKET` | Driver documents bucket. |
| `STAFF_SUPABASE_STORAGE_BUCKET` | Staff profile storage bucket. |
| `FLEET_SUPABASE_STORAGE_BUCKET` | Maintenance/rental documents bucket. |
| `REPORT_SUPABASE_STORAGE_BUCKET` | Report document bucket. |
| `ADMIN_SEED_ENABLED` | Optional first-run admin creation. Disable after use. |
| `TEAM_USERS_SEED_ENABLED` | Demo user seeding. Keep `false` in production. |

### Frontend Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Public backend API base URL. |
| `NEXT_PUBLIC_APP_URL` | Public frontend URL. |
| `NEXT_PUBLIC_ENABLE_DEMO_ROLE` | Demo role switcher. Keep `false` in production. |

## Build and Test Commands

### Backend

```bash
cd backend
./mvnw test
./mvnw -DskipTests package
```

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd -DskipTests package
```

### Frontend

```bash
cd frontend
npm run lint
npm test
npm run build
```

## Deployment Guide

### Frontend Deployment - Vercel

1. Import the repository into Vercel.
2. Set the root directory to `frontend`.
3. Add production environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-aws-backend-domain
NEXT_PUBLIC_APP_URL=https://your-vercel-domain
NEXT_PUBLIC_ENABLE_DEMO_ROLE=false
```

4. Use the default build command:

```bash
npm run build
```

5. Deploy.

### Backend Deployment - AWS

The backend can be hosted on AWS services such as EC2, Elastic Beanstalk, ECS, or App Runner.

Production environment requirements:

```env
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:postgresql://...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=your-strong-32-character-plus-secret
FRONTEND_URL=https://your-vercel-domain
CORS_ALLOWED_ORIGINS=https://your-vercel-domain
SUPABASE_STORAGE_URL=https://your-project-ref.supabase.co/storage/v1
SUPABASE_SERVICE_KEY=your-service-role-key
TEAM_USERS_SEED_ENABLED=false
ADMIN_SEED_ENABLED=false
```

Build the backend JAR:

```bash
cd backend
./mvnw -DskipTests package
```

Run the backend:

```bash
java -jar target/vfms-backend-0.0.1-SNAPSHOT.jar
```

Production health check endpoint:

```text
/health
```

Important production notes:

- Keep `SPRING_PROFILES_ACTIVE=prod`.
- Keep `TEAM_USERS_SEED_ENABLED=false`.
- Disable `ADMIN_SEED_ENABLED` after creating the first production admin.
- Configure AWS security groups to allow only required inbound traffic.
- Use HTTPS for the public backend domain.
- Ensure all Supabase buckets exist before enabling document upload features.
- Ensure the PostgreSQL schema is prepared before production startup.

## Security Highlights

- JWT-based stateless backend authentication.
- Refresh token support.
- Role-based Spring Security request mapping.
- Frontend route protection through proxy middleware and role guards.
- Private Supabase storage with backend-generated signed URLs.
- Backend production profile avoids development defaults.
- Generic internal server error responses to avoid leaking implementation details.
- Public health endpoint is limited to service status only.
- Staff users are restricted to their own trip request records.
- Drivers are restricted to their assigned trips.

## API Overview

| Area | Base Endpoint |
|------|---------------|
| Health | `/health`, `/actuator/health` |
| Authentication | `/api/auth` |
| Current User | `/api/user` |
| Admin Users | `/api/admin/users` |
| Employee Registry | `/api/admin/employee-registry` |
| Staff Profile | `/api/staff-profile` |
| Vehicles | `/api/vehicles` |
| Maintenance | `/api/maintenance` |
| Rentals | `/api/rentals` |
| Vendors | `/api/vendors` |
| Trips | `/api/trips` |
| Fuel | `/api/v1/fuel` |
| Driver Self-Service | `/api/driver` |
| Driver/Staff Management | `/api/drivers` |
| Reports | `/api/reports` |

## Documentation

Additional project documentation is available in the `docs/` directory:

| Document | Purpose |
|----------|---------|
| [`docs/README.md`](docs/README.md) | Documentation index |
| [`docs/FINAL_REPORT_USER_AUTHENTICATION.md`](docs/FINAL_REPORT_USER_AUTHENTICATION.md) | Authentication module report |
| [`docs/FINAL_REPORT_USER_MANAGEMENT.md`](docs/FINAL_REPORT_USER_MANAGEMENT.md) | User management module report |
| [`docs/FINAL_REPORT_FUEL_MANAGEMENT.md`](docs/FINAL_REPORT_FUEL_MANAGEMENT.md) | Fuel module report |
| [`docs/FINAL_REPORT_FLEET_MANAGEMENT.md`](docs/FINAL_REPORT_FLEET_MANAGEMENT.md) | Fleet, maintenance, rental, and vendor module report |
| [`docs/FINAL_REPORT_DRIVER_STAFF_MANAGEMENT.md`](docs/FINAL_REPORT_DRIVER_STAFF_MANAGEMENT.md) | Driver and staff management module report |
| [`docs/COMPLETE_DASHBOARD_INVENTORY.md`](docs/COMPLETE_DASHBOARD_INVENTORY.md) | Dashboard inventory |

## Current Verification Status

The following checks were verified successfully:

```text
Backend tests:       197 passed
Frontend tests:       30 passed
Frontend TypeScript:  passed
Frontend build:       passed
Frontend lint:        passed with warnings
```

Known non-blocking items:

- Frontend lint still reports warnings for older `any` types, unused imports, and React hook dependency cleanup.
- OpenStreetMap/Nominatim/OSRM usage should be reviewed if the deployed application receives high production traffic.
- Production database schema must be created or migrated before AWS backend startup.

## Recommended Production Checklist

- Set strong production `JWT_SECRET`.
- Set `SPRING_PROFILES_ACTIVE=prod`.
- Set Vercel `NEXT_PUBLIC_API_URL` to the deployed AWS backend URL.
- Set backend `CORS_ALLOWED_ORIGINS` to the deployed Vercel URL.
- Disable demo seed users in production.
- Disable admin seed after the first admin account is created.
- Confirm Supabase storage buckets and policies.
- Confirm PostgreSQL schema readiness.
- Confirm `/health` returns `UP` from the deployed backend.
- Confirm login, dashboard routing, document upload, and signed document access after deployment.

## License

This project was developed as an academic/team software engineering project. Usage, distribution, and submission should follow the relevant course, institution, or team guidelines.
