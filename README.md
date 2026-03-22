# FleetPro - Vehicle Fleet Management System (VFMS)

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-cyan)

> Module Focus: Driver Profile Management (Student C)
> Status: In Development

## Project Overview

This repository contains the Driver Profile Management feature for FleetPro (VFMS).

The feature provides a complete flow to manage driver records in the system, including:
- Driver registration and profile creation
- Driver information updates
- Driver listing and profile viewing
- Basic validation and error handling for data consistency

## Key Features

### Driver Profile Management
- Create new driver profiles with required details
- View all driver records in a table/list view
- Edit driver profile data from the UI
- Remove driver records when needed

### Backend API Layer
- REST endpoints for CRUD operations in the driver module
- DTO-based request/response contracts for clean API boundaries
- Mapper layer to transform entity and DTO models
- Centralized exception handling for consistent API responses

### Frontend Integration
- Next.js page for driver management
- Reusable form component for create/update flows
- API client utilities for backend communication
- Toast/feedback components for user actions

## Technology Stack

### Backend
- Java 21
- Spring Boot 3.4.0
- Spring Data JPA
- Spring Security
- PostgreSQL
- Flyway migrations

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI / shadcn components

## Relevant Project Structure

```text
VFMS/
├── backend/
│   ├── src/main/java/com/vfms/
│   │   ├── dsm/
│   │   │   ├── controller/      # Driver API controllers
│   │   │   ├── dto/             # Driver request/response models
│   │   │   ├── entity/          # Driver entities
│   │   │   ├── exception/       # Driver-specific exceptions
│   │   │   ├── mapper/          # Entity <-> DTO mapping
│   │   │   ├── repository/      # Data access layer
│   │   │   └── service/         # Business logic
│   │   └── common/              # Shared API response and enums
│   └── src/main/resources/db/migration/
│       ├── V1__create_drivers.sql
│       └── V2__create_staff.sql
│
└── frontend/
    └── src/
        ├── app/drivers/page.tsx
        ├── components/drivers/DriverForm.tsx
        ├── components/StatusBadge.tsx
        ├── lib/api.ts
        └── types/index.ts
```

## Getting Started

### Prerequisites
- Java JDK 21+
- Node.js 18+
- PostgreSQL running on port 5432

### 1. Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts at http://localhost:8080.

Update database settings in src/main/resources/application.properties if needed:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/vfms_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at http://localhost:3000.

## Testing

Run backend tests:

```bash
cd backend
./mvnw test
```

## License

This project is proprietary software developed for the Vehicle Fleet Management System (VFMS) academic requirement.

---
Developed by: Kavishanth (Student C)