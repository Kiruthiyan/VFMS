# Vehicle Maintenance and Rentals Module

## 1. Module Overview

This module implements the **Vehicle Maintenance and Rentals** functionality for the Vehicle Fleet Management System (VFMS). It focuses on managing fleet vehicle lifecycle activities, specifically maintenance tracking and rental bookings.

### Frontend
Provides a responsive, role-based dashboard for:
- Visualizing vehicle status
- Submitting maintenance requests
- Managing rental reservations

⚠️ Currently operates as a functional prototype using Mock Data and Local Storage for state persistence.

### Backend
Provides a RESTful API and database structure for managing Vehicle entities, supporting critical status states such as:

- AVAILABLE
- MAINTENANCE
- RENTED
- ON_TRIP
- INACTIVE

---

## 2. Features Implemented

### Frontend Features

#### Maintenance Dashboard
- Tabbed Navigation between:
  - Maintenance & Repairs
  - Vehicle Bookings
- Request Lifecycle Management:
  - Pending
  - In Progress
  - Completed
  - Rejected
- Interactive Dialog Forms:
  - Vehicle selection
  - Issue type
  - Description input
- Role-Based Access Control (UI Level)
- Mock Data Persistence using localStorage
- Document Attachment UI

#### Vehicle Rentals
- Interactive Vehicle Catalog (Card-based grid)
- Booking Wizard modal for selecting vehicle and dates
- Availability Tracking with status badges
- Admin controls for approving/rejecting rental requests

---

## 3. Backend Implementation

### Entity Class

com.vfms.vehicle.model.Vehicle
- Maps to table: vehicle
- Key fields:
  - status
  - lastServiceDate
  - currentOdometer
  - fuelLevel
  - licensePlate

---

### Controller Class

com.vfms.vehicle.controller.VehicleController

Handles all HTTP requests under:
```
/api/vehicles
```

---

### Service Class

com.vfms.vehicle.service.VehicleService

Contains business logic for:
- Saving vehicles
- Updating vehicles
- Retrieving vehicles

---

### Repository Interface

com.vfms.vehicle.repository.VehicleRepository

- Extends JpaRepository
- Provides standard CRUD operations

---

### API Endpoints Implemented

GET /api/vehicles
- Retrieve all vehicles

GET /api/vehicles/{id}
- Retrieve vehicle by ID

POST /api/vehicles
- Create new vehicle

PUT /api/vehicles/{id}
- Update vehicle details/status

DELETE /api/vehicles/{id}
- Delete vehicle

---

### Database Table

vehicle

Columns:
- id
- make
- model
- license_plate
- status
- year
- fuel_type
- fuel_level
- current_odometer
- last_service_date

---

## 4. Frontend Implementation

### Page Created

src/app/dashboard/vehicles/maintenance/page.tsx

Main module dashboard page.

---

### Main Component

FleetOperationsPage

Implements:
- handleReport
- handleBookVehicle
- handleApprove

Uses:
- Dialog
- Table
- Card
- Tabs
- Select (from shadcn/ui)

---

### Forms Implemented

New Maintenance Request Form:
- Vehicle ID
- Issue Type
- Description

Vehicle Booking Form:
- Start Date
- End Date
- Driver assignment

Request Editor:
- Cost update
- Downtime update

---

### API Service File

src/services/vehicleService.ts

Methods implemented:
- getAll()
- getById(id)
- create(vehicle)
- update(id, vehicle)
- delete(id)

Note:
Dashboard currently uses Mock Data.
vehicleService.ts is prepared for backend integration.

---

## 5. API Integration

Frontend Service:
src/services/vehicleService.ts

GET /api/vehicles
- Fetch all vehicles

GET /api/vehicles/{id}
- Fetch single vehicle

POST /api/vehicles
- Create vehicle

PUT /api/vehicles/{id}
- Update vehicle

DELETE /api/vehicles/{id}
- Remove vehicle

---

## 6. Database Design

Table Created:
vehicle

Fields:
- id (Primary Key, Auto-increment)
- licensePlate (Unique)
- status (Core logic field)
- make
- model
- category
- fuelType
- fuelLevel
- year
- currentOdometer
- lastServiceDate

---

## 7. Folder Structure (Only My Module Files)

backend/
└── src/main/java/com/vfms/vehicle
    ├── controller
    │   └── VehicleController.java
    ├── model
    │   └── Vehicle.java
    ├── repository
    │   └── VehicleRepository.java
    └── service
        └── VehicleService.java

frontend/
├── src/app/dashboard/vehicles/maintenance
│   └── page.tsx
└── src/services
    └── vehicleService.ts

---

## 8. Setup Instructions

Backend Setup:

Navigate to backend/

Ensure PostgreSQL is running and configured in application.properties

Run:
```
./mvnw spring-boot:run
```

Server:
```
http://localhost:8080
```

Frontend Setup:

Navigate to frontend/

Install dependencies:
```
npm install
```

Run development server:
```
npm run dev
```

Access module:
```
http://localhost:3000/dashboard/vehicles/maintenance
```

---

## 9. Current Status

[✔] Frontend UI fully implemented  
[✔] Maintenance & booking simulation working  
[✔] Backend CRUD API complete  
[✔] Database entity mapping correct  

[!] Frontend currently uses Mock Data  
[!] vehicleService.ts not yet connected to dashboard state  

---

## Author Contribution Statement

This README reflects only the implemented functionality of the Vehicle Maintenance and Rentals Module developed as part of the VFMS project. It includes only the features, files, and components created and implemented within this module.
