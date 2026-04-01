# VFMS - Staff, Driver, Certification, Document, Availability, and Leave Management

Vehicle Fleet Management System (VFMS) module for managing staff profiles, driver profiles, certifications, licenses, driver document uploads, driver availability tracking, and driver leave requests.

This branch/project currently implements Staff Management, Driver Management, Driver License Management, Driver Certification Management, Driver Document Upload, Driver Availability Tracking, and Driver Leave Management with a Spring Boot backend and a Next.js frontend.

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

### Driver Document Upload (Implemented - Latest)
- Upload one or multiple documents for a driver
- List uploaded documents per driver
- Delete uploaded documents
- Supported file types: PDF, JPG, PNG
- Document entity types: LICENSE, CERTIFICATION, PROFILE, OTHER
- Frontend documents tab with drag-and-drop and quick download/delete actions

### Driver Availability Tracking (Implemented - Latest)
- Track a driver's current availability state
- Update availability with reason and actor metadata
- View availability status history by driver
- Filter drivers by availability status
- Frontend availability tab for current status and status update actions

### Driver Leave Management (Implemented - Latest)
- Submit leave requests for a driver
- Review pending leave requests
- Approve or reject leave requests with notes and approver metadata
- Automatically set driver availability to ON_LEAVE when leave is approved
- Scheduled job restores availability to AVAILABLE when approved leave ends
- Frontend leave approval page for processing pending requests

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
│       │       │   ├── DriverAvailabilityController.java
│       │       │   ├── DriverCertificationController.java
│       │       │   ├── DriverLeaveController.java
│       │       │   ├── DriverDocumentController.java
│       │       │   ├── DriverLicenseController.java
│       │       │   └── StaffController.java
│       │       ├── dto/
│       │       │   ├── CertificationRequest.java
│       │       │   ├── AvailabilityUpdateRequest.java
│       │       │   ├── LeaveRequest.java
│       │       │   ├── LeaveApprovalRequest.java
│       │       │   └── ...
│       │       ├── entity/
│       │       │   ├── Driver.java
│       │       │   ├── DriverAvailability.java
│       │       │   ├── DriverAvailabilityLog.java
│       │       │   ├── DriverCertification.java
│       │       │   ├── DriverLeave.java
│       │       │   ├── DriverDocument.java
│       │       │   ├── DriverLicense.java
│       │       │   ├── Staff.java
│       │       │   └── BaseEntity.java
│       │       ├── exception/
│       │       ├── repository/
│       │       │   ├── DriverRepository.java
│       │       │   ├── DriverAvailabilityRepository.java
│       │       │   ├── DriverAvailabilityLogRepository.java
│       │       │   ├── DriverCertificationRepository.java
│       │       │   ├── DriverLeaveRepository.java
│       │       │   ├── DriverDocumentRepository.java
│       │       │   ├── DriverLicenseRepository.java
│       │       │   ├── NotificationLogRepository.java
│       │       │   └── StaffRepository.java
│       │       ├── scheduler/
│       │       │   ├── LicenseExpiryScheduler.java
│       │       │   └── CertificationExpiryScheduler.java
│       │       └── service/
│       │           ├── DriverService.java
│       │           ├── DriverAvailabilityService.java
│       │           ├── DriverCertificationService.java
│       │           ├── DriverLeaveService.java
│       │           ├── DriverDocumentService.java
│       │           ├── DriverLicenseService.java
│       │           └── StaffService.java
│       └── resources/
│           ├── application.properties
│           └── db/migration/
│               ├── V1__create_drivers.sql
│               ├── V2__create_staff.sql
│               ├── V3__create_driver_licenses.sql
│               ├── V4__create_notification_log.sql
│               ├── V6__create_driver_leaves.sql
│               ├── V13__create_driver_availability.sql
│               ├── V7__create_driver_certifications.sql
│               ├── V8__normalize_notification_log_entity_id_to_uuid.sql
│               └── V12__create_driver_documents.sql
└── frontend/
    ├── package.json
    └── src/
    ├── app/
    │   ├── auth/
    │   ├── drivers/
    │   ├── leaves/
    │   ├── staff/
    │   └── page.tsx
    ├── components/
    │   ├── drivers/
    │   │   ├── DriverForm.tsx
    │   │   ├── DriverLicensesTab.tsx
    │   │   ├── DriverCertificationsTab.tsx
    │   │   ├── DriverAvailabilityTab.tsx
    │   │   └── DriverDocumentsTab.tsx
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

### Driver Document Endpoints (NEW)

Base path: /api/drivers

- POST /api/drivers/{driverId}/documents
    - Upload a document for a driver (multipart form-data)
    - Request params: file, entityType, entityId (optional)
- GET /api/drivers/{driverId}/documents
    - Get all documents for a driver
- DELETE /api/drivers/documents/{id}
    - Delete a document by id

### Driver Availability Endpoints (NEW)

Base path: /api/drivers

- GET /api/drivers/{driverId}/availability
    - Get current availability for a driver
- PATCH /api/drivers/{driverId}/availability
    - Update driver availability (status, reason)
    - Requires header: X-User-Id
- GET /api/drivers/{driverId}/availability/history
    - Get availability change history for a driver
- GET /api/drivers/availability?status={status}
    - Get all drivers by availability status
    - Status values: AVAILABLE, ON_TRIP, ON_LEAVE, INACTIVE

### Driver Leave Endpoints (NEW)

Base path: /api/drivers

- POST /api/drivers/leaves
    - Submit a leave request
    - Request body: driverId (UUID), leaveType, startDate, endDate, reason
- PATCH /api/drivers/leaves/{leaveId}/process
    - Approve or reject a leave request
    - Request body: status (APPROVED or REJECTED), approvalNotes
    - Requires header: X-User-Id
- GET /api/drivers/{driverId}/leaves
    - Get all leave requests for a driver
- GET /api/drivers/leaves/pending
    - Get all pending leave requests

## Database

Database migrations are available in:
- backend/src/main/resources/db/migration/

Current migrations:
- V1__create_drivers.sql - Driver profiles table
- V2__create_staff.sql - Staff profiles table
- V3__create_driver_licenses.sql - Driver licenses table
- V4__create_notification_log.sql - Notification logs table
- V6__create_driver_leaves.sql - Driver leaves table and indexes (NEW)
- V13__create_driver_availability.sql - Driver availability and availability log tables (NEW)
- V7__create_driver_certifications.sql - Driver certifications table (NEW)
- V8__normalize_notification_log_entity_id_to_uuid.sql - Schema normalization migration
- V12__create_driver_documents.sql - Driver documents table and indexes (NEW)

Document upload configuration:
- app.upload.dir (optional) - upload storage directory (default: uploads/documents)

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
- Driver document upload stores files on local disk (upload directory) and persists metadata in driver_documents.
- Driver availability updates are audited in driver_availability_log with actor and reason.
- Leave approvals update driver availability to ON_LEAVE; a scheduled backend task restores availability to AVAILABLE when leave end date is reached.
- Frontend leave approval UI is available at /leaves (file: frontend/src/app/leaves/page.tsx).

## License

Academic project for VFMS coursework.