# VFMS - Feature: License Expiry Monitoring

Vehicle Fleet Management System (VFMS) monorepo with a Spring Boot backend and Next.js frontend.
This branch/version focuses on implementing license expiry monitoring in the backend while keeping the frontend scaffolded for future auth and dashboard integration.

## Tech Stack

- Backend: Java 21, Spring Boot 3.4, Spring Data JPA, Spring Security, Spring Mail, Lombok
- Database: PostgreSQL (Supabase)
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Sonner, Axios
- Build Tools: Maven Wrapper, npm

## Current Implementation

### Backend

- Scheduled license expiry monitoring is enabled using Spring scheduling.
- Daily scheduler runs at 06:00 and:
  - Marks licenses as EXPIRED if expiry date is before today.
  - Marks licenses as EXPIRING_SOON if expiry date is within the next 30 days.
  - Stores notification entries for expiry and expiring-soon events.
- DSM module includes:
  - Entities: Driver, DriverLicense, NotificationLog
  - Repositories: DriverLicenseRepository, NotificationLogRepository
- Global exception handling is available with a standard error DTO.
- Security configuration is currently a placeholder that permits all requests.

### Frontend

- Landing page is implemented with a full marketing-style UI.
- Auth routes for login and signup are currently placeholders.
- API client (Axios) and basic auth role/type utilities are scaffolded.
- Middleware is currently pass-through (no route protection yet).

## Project Structure

```text
VFMS/
├── backend/
│   ├── src/main/java/com/vfms/
│   │   ├── common/                 # shared DTOs, enums, exception handler
│   │   ├── config/                 # security + CORS configuration
│   │   ├── dsm/
│   │   │   ├── entity/             # Driver, DriverLicense, NotificationLog
│   │   │   ├── repository/         # DSM repositories
│   │   │   └── scheduler/          # LicenseExpiryScheduler
│   │   └── VfmsApplication.java    # @EnableScheduling enabled
│   └── src/main/resources/
│       └── application.properties  # Supabase, JPA, JWT, mail, logging
└── frontend/
    └── src/
        ├── app/                    # landing, layout, auth pages
        ├── components/             # shared UI and providers
        ├── lib/                    # api/auth/util helpers
        └── middleware.ts           # route middleware (placeholder)
```

## Configuration

Backend configuration is currently set for Supabase PostgreSQL in application.properties, including mail and JWT values.

Important recommendation:
- Move secrets (DB password, JWT secret, mail password) into environment variables before production deployment.

## Local Setup

### Prerequisites

- Java 21+
- Node.js 18+
- npm

### Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

For Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Default backend URL:
- http://localhost:8080

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL:
- http://localhost:3000

Optional frontend environment variable:
- NEXT_PUBLIC_API_URL (defaults to http://localhost:8080)

## Build and Test

### Backend

Compile:

```bash
cd backend
./mvnw compile
```

Run tests:

```bash
cd backend
./mvnw test
```

### Frontend

```bash
cd frontend
npm run build
npm run lint
```

## Notes

- Flyway baseline properties are configured, but no migration scripts are currently included.
- Security, auth login/signup, and route RBAC are marked in code as pending feature work.

---
Developed by - Kavishanth