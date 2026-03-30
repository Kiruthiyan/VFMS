# VFMS - Staff Profile Management

Vehicle Fleet Management System (VFMS) module for managing staff profiles.

This branch/project currently implements the Staff Management domain with a Spring Boot backend and a Next.js frontend.

## Module Owner

- Kavishanth (Student C)

## Tech Stack

- Backend: Java 21, Spring Boot 3.4, Spring Data JPA, Spring Security, Validation, PostgreSQL
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Axios, React Hook Form, Zod
- Build Tools: Maven Wrapper and npm

## Current Scope

Implemented:
- Create staff profile
- Get staff by id
- List staff with pagination
- Update staff profile
- Deactivate staff profile
- Basic frontend staff page with search and add-staff dialog

In progress / placeholders:
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
│       │       ├── dto/
│       │       ├── entity/
│       │       ├── exception/
│       │       ├── repository/
│       │       └── service/
│       └── resources/
│           ├── application.properties
│           └── db/migration/
└── frontend/
    ├── package.json
    └── src/
    ├── app/
    │   ├── auth/
    │   └── staff/
    ├── components/
    ├── lib/
    └── types/
```

## Backend API (Staff)

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

## Database

Staff table migration is available in:
- backend/src/main/resources/db/migration/V2__create_staff.sql

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

## License

Academic project for VFMS coursework.