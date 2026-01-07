# Vehicle Fleet Management System (VFMS)

## 1. Introduction
This project is about designing and developing a Vehicle Fleet Management System (VFMS) for an organization. The VFMS will help manage vehicles, maintenance activities, rentals, drivers, trips, and reporting. It is a full-scale system aimed at providing efficient vehicle tracking, maintenance cost management, driver allocation, and data-driven reporting.

## 2. Purpose
The purpose of this system is to automate and streamline vehicle-related processes in an organization. The system will allow recording of vehicle maintenance requests, monitoring maintenance costs, handling vehicle rentals, managing drivers, scheduling trips, and generating reports for decision-making.

## 3. Project Scope
This repository focuses specifically on the **Fuel Management Module**, which includes:

### Fuel Management Module
- Record fuel usage and purchases.
- Track monthly/vehicle-wise fuel consumption.
- Generate fuel efficiency reports and flag misuse.

## 4. Users & Roles
The system supports the following types of users:
- **System User (District/Head Office):** Can create/edit requests, record rentals, schedule trips.
- **Authorized User (Approver):** Can approve/reject maintenance and booking requests.
- **Driver:** Assigned to trips, can view trip details.
- **Administrator:** Manages system users, configurations, and overall system settings.

## 5. Functional Requirements
### Fuel Management
- Record fuel purchases with receipts.
- Track per-vehicle fuel consumption.
- Alerts for unusual consumption.

## 6. Assumptions & Constraints
- System is standalone but can integrate with Finance later.
- The interface will be in English.
- Requires stable network and trained users.
- Role-based access control will be implemented.

## 7. Technology Stack
The project uses the following modern technology stack to ensure scalability, maintainability, and alignment with industry practices:

### 7.1 Frontend
- **Framework:** Next.js (React with Server-Side Rendering (SSR) and Static Site Generation (SSG))
- **State Management:** Zustand (for global state)
- **UI Library / Styling:** Tailwind CSS + shadcn/ui
- **Forms Validation:** Zod
- **Form Handling:** React Hook Form
- **File Handling:** React Dropzone, PDF.js viewer
- **Mobile:** React Native with Expo for cross-platform mobile development

### 7.2 Backend
- **Runtime:** Java 21
- **Framework:** Spring Boot
- **API:** REST API
- **Authentication:** JWT with refresh tokens, OAuth 2.0 / OIDC
- **File Processing:** Sharp (for images), pdf-lib (for PDFs)

## 8. Team Breakdown
- **Student B:** Fuel Management Module