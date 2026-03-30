# VFMS - Staff Profile & Driver Certification Management

Vehicle Fleet Management System (VFMS) module for managing staff profiles and driver certifications.

This branch/project currently implements the Staff Management and Driver Certification domains with a Spring Boot backend and a Next.js frontend.

## Module Owner

- Kavishanth (Student C)

## Developed by

- Kavishanth

## Tech Stack

- Backend: Java 21, Spring Boot 3.4, Spring Data JPA, Spring Security, Validation, PostgreSQL
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Axios, React Hook Form, Zod
- Build Tools: Maven Wrapper and npm

## Current Scope

### Staff Management (Implemented)
- Create staff profile
- Get staff by id
- List staff with pagination
- Update staff profile
- Deactivate staff profile
- Basic frontend staff page with search and add-staff dialog

### Driver Certification Management (Implemented)
- Add driver certification record
- Get certifications by driver
- Update certification record
- Delete certification record
- Frontend certifications tab with form dialog and list display
- Certification status tracking (VALID, EXPIRING_SOON, EXPIRED)
- Certification types (DEFENSIVE_DRIVING, FIRST_AID, HAZMAT, HEAVY_VEHICLE, PASSENGER_TRANSPORT, OTHER)

### Certification Expiry Monitoring (Implemented)
- Daily scheduled job updates certification status automatically
- Scheduler: backend/src/main/java/com/vfms/dsm/scheduler/CertificationExpiryScheduler.java
- Runs every day at 06:00 using cron: 0 0 6 * * *
- Expired certifications are marked as EXPIRED and logged as CERT_EXPIRED notifications
- Certifications expiring within 30 days are marked as EXPIRING_SOON and logged as CERT_EXPIRING_SOON notifications

### In progress / placeholders
- Authentication login/signup pages are placeholders in frontend
- Security config currently permits all requests and is marked for JWT integration later

## Project Structure

```text
VFMS/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/vfms/
│       │   ├── config/
│       │   └── dsm/
│       │       ├── controller/
│       │       │   ├── DriverController.java
│       │       │   ├── DriverCertificationController.java
│       │       │   ├── DriverLicenseController.java
│       │       │   └── StaffController.java
│       │       ├── dto/
│       │       │   ├── CertificationRequest.java
│       │       │   └── ...
│       │       ├── entity/
│       │       │   ├── Driver.java
│       │       │   ├── DriverCertification.java
│       │       │   ├── DriverLicense.java
│       │       │   ├── Staff.java
│       │       │   └── BaseEntity.java
│       │       ├── exception/
│       │       ├── repository/
│       │       │   ├── DriverRepository.java
│       │       │   ├── DriverCertificationRepository.java
│       │       │   ├── DriverLicenseRepository.java
│       │       │   ├── NotificationLogRepository.java
│       │       │   └── StaffRepository.java
│       │       ├── scheduler/
│       │       │   ├── LicenseExpiryScheduler.java
│       │       │   └── CertificationExpiryScheduler.java
│       │       └── service/
│       │           ├── DriverService.java
│       │           ├── DriverCertificationService.java
│       │           ├── DriverLicenseService.java
│       │           └── StaffService.java
│       └── resources/
│           ├── application.properties
│           └── db/migration/
│               ├── V1__create_drivers.sql
│               ├── V2__create_staff.sql
│               ├── V3__create_driver_licenses.sql
│               ├── V4__create_notification_log.sql
│               ├── V7__create_driver_certifications.sql
│               └── V8__normalize_notification_log_entity_id_to_uuid.sql
└── frontend/
    ├── package.json
    └── src/
    ├── app/
    │   ├── auth/
    │   ├── drivers/
    │   ├── staff/
    │   └── page.tsx
    ├── components/
    │   ├── drivers/
    │   │   ├── DriverForm.tsx
    │   │   ├── DriverLicensesTab.tsx
    │   │   └── DriverCertificationsTab.tsx
    │   └── ...
    ├── lib/
    └── types/
```

## Backend API

### Staff Endpoints

Base path: /api/staff

- POST /api/staff
    - Create a staff profile
- GET /api/staff/{id}
    - Fetch one staff profile
- GET /api/staff?page=0&size=10
    - Fetch paginated staff profiles
- PUT /api/staff/{id}
    - Update a staff profile
- PATCH /api/staff/{id}/deactivate
    - Mark staff as inactive

### Driver Endpoints

Base path: /api/drivers

- POST /api/drivers
    - Create a driver profile
- GET /api/drivers/{id}
    - Fetch one driver profile
- GET /api/drivers?page=0&size=10
    - Fetch paginated driver profiles
- PUT /api/drivers/{id}
    - Update a driver profile
- PATCH /api/drivers/{id}/deactivate
    - Deactivate a driver
- PATCH /api/drivers/{id}/status?status={status}
    - Update driver status (ACTIVE, INACTIVE, SUSPENDED)

### Driver License Endpoints

Base path: /api/drivers

- POST /api/drivers/{driverId}/licenses
    - Add a license to a driver
- GET /api/drivers/{driverId}/licenses
    - Get all licenses for a driver
- PUT /api/drivers/licenses/{id}
    - Update a driver license
- DELETE /api/drivers/licenses/{id}
    - Delete a driver license

### Driver Certification Endpoints (NEW)

Base path: /api/drivers

- POST /api/drivers/{driverId}/certifications
    - Add a certification to a driver
- GET /api/drivers/{driverId}/certifications
    - Get all certifications for a driver
- PUT /api/drivers/certifications/{id}
    - Update a driver certification
- DELETE /api/drivers/certifications/{id}
    - Delete a driver certification

## Database

Database migrations are available in:
- backend/src/main/resources/db/migration/

Current migrations:
- V1__create_drivers.sql - Driver profiles table
- V2__create_staff.sql - Staff profiles table
- V3__create_driver_licenses.sql - Driver licenses table
- V4__create_notification_log.sql - Notification logs table
- V7__create_driver_certifications.sql - Driver certifications table (NEW)
- V8__normalize_notification_log_entity_id_to_uuid.sql - Schema normalization migration

Required database environment variables in backend:
- DB_URL
- DB_USER
- DB_PASSWORD

Other backend env vars:
- JWT_SECRET
- MAIL_USERNAME
- MAIL_PASSWORD
- CORS_ALLOWED_ORIGINS (optional, has localhost defaults)

## Run Locally

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend runs on:
- http://localhost:8080

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
- http://localhost:3000

Set API base URL for frontend if needed:
- NEXT_PUBLIC_API_URL=http://localhost:8080

## Build and Test

Backend tests:

```bash
cd backend
./mvnw test
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## Notes

- Security is currently configured with permit-all in backend security config as a temporary setup.
- Frontend login and signup pages are placeholders and will be replaced by the auth feature branch.
- Automated certification expiry monitoring is handled by CertificationExpiryScheduler and writes to notification_log.

## License

Academic project for VFMS coursework.