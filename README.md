# FleetPro - Vehicle Fleet Management System (VFMS)

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

> **Module Focus:** Driver and Staff Managemant Module
> **Status:** Complete

## Project Overview

FleetPro is a Vehicle Fleet Management System designed to support the daily operational needs of a fleet-driven organization. This repository contains the Driver and Staff Managemant Module, which is responsible for maintaining workforce records, supporting driver readiness decisions, and giving administrators a single place to manage the people connected to fleet operations.

The module combines a Spring Boot backend and a Next.js frontend to provide a structured workflow for handling driver and staff data. It is built to reduce manual tracking, improve traceability, and support safer operational decisions.

## Module Focus

This module is centered on the administration of drivers and staff members within VFMS. It keeps core records, supports related operational checks, and helps the system maintain reliable data for fleet planning and daily use.

## Key Features

The module includes the following major capabilities, each described briefly below.

### Driver and Staff Records
- Maintain driver and staff profiles in a centralized system.
- Store identity, contact, employment, and status information.
- Support search, review, update, and controlled removal.

### License and Certification Handling
- Track driver licenses and expiry dates.
- Store certification records linked to each driver.
- Support validation of required qualification documents.

### Document Management
- Upload and manage driver-related documents.
- Keep supporting files organized for operational reference.
- Allow administrators to view and remove documents when needed.

### Availability and Readiness
- Track whether a driver is available, on leave, or occupied.
- Maintain readiness data for assignment decisions.
- Help operations staff quickly identify drivers suitable for dispatch.

### Qualification and Eligibility Checks
- Verify whether a driver meets vehicle category requirements.
- Check assignment eligibility using employee details and trip requirements.
- Return clear reasons when a driver does not qualify.

### Infraction and Performance Monitoring
- Record driver infractions and their resolution status.
- Track monthly performance scores for review.
- Support follow-up decisions based on driver history.

### Staff Service Requests
- Allow staff to submit vehicle-related service requests.
- Track requests through an operational status flow.
- Help the support team monitor and resolve active requests.

## Technical Architecture

### Backend
- Java 21 with Spring Boot
- Spring Data JPA for persistence
- Spring Security for request protection
- Bean Validation for request checks
- PostgreSQL for data storage
- Flyway migrations for schema management

### Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS and shadcn/ui components
- React Hook Form with Zod validation
- Central API access through a shared client layer

## Project Structure

```text
Driver & Staff Management/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/vfms/
│       │   ├── common/
│       │   ├── config/
│       │   └── dsm/
│       │       ├── controller/
│       │       ├── dto/
│       │       ├── entity/
│       │       ├── repository/
│       │       ├── scheduler/
│       │       └── service/
│       └── resources/
│           └── db/migration/
└── frontend/
    └── src/
        ├── app/
        ├── components/
        ├── lib/
        └── types/
```

## Getting Started

### Prerequisites
- Java JDK 21+
- Node.js 18+
- Maven Wrapper included in the backend
- PostgreSQL database

### Backend Setup

1. Move into the backend directory.
2. Configure the database and environment values in the application files or local environment.
3. Start the backend server with the Maven Wrapper.

### Frontend Setup

1. Move into the frontend directory.
2. Install the Node.js dependencies.
3. Start the development server.

## Testing

The backend includes automated tests for the main module services. These tests cover driver and staff-related business logic and help confirm that the module behaves correctly after changes.

Run the backend tests from the backend directory using the Maven Wrapper.

## Module Owner

- Kavishanth (Student C)

## Developed By

- Kavishanth

## Notes

This module is part of a larger VFMS group project and focuses on the administrative layer for drivers and staff. It is intended for administrators and operations users who need dependable access to workforce records and related support functions.

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
- Driver infractions are persisted in driver_infractions and can be resolved through OPEN/UNDER_REVIEW/RESOLVED lifecycle.
- Staff vehicle service requests are persisted in staff_service_requests and can be tracked through OPEN to RESOLVED lifecycle states.
- Driver qualification validation checks license and certification eligibility per requested vehicle category.

## License

Academic project for VFMS coursework.