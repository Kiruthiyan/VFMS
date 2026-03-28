# VFMS - Vehicle Fleet Management System

VFMS is a full-stack web application with a Spring Boot backend and a Next.js frontend.
This branch includes Driver License Management backend APIs, database migrations, and a frontend driver license tab component.

## Current Tech Stack

- Backend: Spring Boot 3.4.0, Java 21, Spring Data JPA, Spring Security, Bean Validation, Flyway
- Database: PostgreSQL (configured for Supabase)
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- HTTP client: Axios
- Notifications: Sonner toast

## Project Structure

- backend
    - src/main/java/com/vfms
        - common
            - dto
            - enums
            - exeception
        - config
        - dsm
            - controller
            - dto
            - entity
            - exception
            - repository
            - service
    - src/main/resources
        - application.properties
        - db/migration
- frontend
    - src/app
        - page.tsx
        - auth/login/page.tsx
        - auth/signup/page.tsx
    - src/components
        - drivers/DriverLicensesTab.tsx
        - providers
        - ui
    - src/lib

## Implemented Driver License Management

### Backend

- Driver license entity and DTOs
- Driver license CRUD service and controller
- Notification log entity and repository
- Flyway migrations for:
    - driver_licenses table
    - notification_log table

### REST Endpoints

- GET /api/drivers/{driverId}/licenses
- POST /api/drivers/{driverId}/licenses
- PUT /api/drivers/licenses/{id}
- DELETE /api/drivers/licenses/{id}

Base backend URL: http://localhost:8080

### Frontend

- DriverLicensesTab component added at frontend/src/components/drivers/DriverLicensesTab.tsx
- Current public pages:
    - /
    - /auth/login
    - /auth/signup

Note: DriverLicensesTab is currently a reusable component and is not yet mounted to a route page.

## Database Configuration

The backend is configured in backend/src/main/resources/application.properties to use Supabase PostgreSQL.

Datasource values currently set:

- spring.datasource.url=jdbc:postgresql://db.bbfnkmzqftuvwesnmjkj.supabase.co:5432/postgres?sslmode=require
- spring.datasource.driver-class-name=org.postgresql.Driver
- spring.datasource.username=postgres
- spring.datasource.password=kiruthiyan1234

Important: Move credentials and secrets to environment variables before production use.

## How to Run

### Backend

1. Open terminal in backend folder.
2. Run:
     - Windows: mvnw.cmd spring-boot:run
3. Backend starts at http://localhost:8080

### Frontend

1. Open terminal in frontend folder.
2. Install dependencies:
     - npm install
3. Run dev server:
     - npm run dev
4. Open http://localhost:3000

## Useful Commands

### Backend

- Build: mvnw.cmd -DskipTests compile
- Test: mvnw.cmd test

### Frontend

- Type check: npx tsc --noEmit
- Lint: npm run lint
- Build: npm run build

## Notes

- Backend compile currently succeeds with the DSM classes included.
- Frontend type check currently succeeds after dependency and component alignment changes.

## Author

Developed by Kavishanth.