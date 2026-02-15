Vehicle Maintenance and Rentals Module
1. Module Overview
This module implements the Vehicle Maintenance and Rentals functionality for the Vehicle Fleet Management System (VFMS). It serves as a comprehensive system for managing the lifecycle of fleet vehicles, specifically focusing on maintenance tracking and rental bookings.

Frontend: Provides a responsive, role-based dashboard for visualizing vehicle status, submitting maintenance requests, and managing rental reservations. Currently operates as a functional prototype using Mock Data and Local Storage for state persistence.
Backend: Provides a robust RESTful API and database structure for managing 
Vehicle
 entities, supporting critical status states like MAINTENANCE and RENTED.
2. Features Implemented
Frontend Features
Maintenance Dashboard:

Tabbed Navigation: Instant switching between "Maintenance & Repairs" and "Vehicle Bookings" views.
Request Lifecycle Management: Visual tracking of maintenance requests through Pending, In Progress, Completed, and Rejected states.
Interactive Forms: Dialog-based forms for creating new maintenance requests (Vehicle selection, Issue type, Description).
Role-Based Access Control (UI): Conditional rendering of "Approve/Reject" actions based on user role (e.g., Approver vs. Driver).
Mock Data & Persistence: Uses localStorage to persist requests and bookings across sessions, initialized with sample data.
Document Attachment UI: Interface for uploading and listing maintenance-related documents (e.g., invoices).
Vehicle Rentals:

Interactive Vehicle Catalog: Card-based grid displaying available vehicles with details (Rate, Fuel Type, Seats).
Booking Wizard: Step-by-step modal for selecting vehicles and specifying rental dates.
Availability Tracking: Visual badges differentiating Available vehicles from those In Maintenance or Rented.
Status Management: Admin controls for approving or rejecting rental requests.
Backend Features
Vehicle Entity Management:
Comprehensive 
Vehicle
 entity model mapping strict database constraints.
Status enumeration support (AVAILABLE, MAINTENANCE, RENTED, ON_TRIP, INACTIVE).
REST API:
Full CRUD (Create, Read, Update, Delete) endpoints for Vehicle management.
Exception handling for "Vehicle not found" scenarios.
Database Integration:
PostgreSQL encapsulation via Spring Data JPA Repositories.
3. Backend Implementation
Entity Classes
com.vfms.vehicle.model.Vehicle
Maps to table: vehicle
Key fields: status, lastServiceDate, currentOdometer, fuelLevel, licensePlate.
Controller Classes
com.vfms.vehicle.controller.VehicleController
Handles all HTTP requests under /api/vehicles.
Service Classes
com.vfms.vehicle.service.VehicleService
Contains business logic for saving, updating, and retrieving vehicles.
Repository Interfaces
com.vfms.vehicle.repository.VehicleRepository
Extends JpaRepository for standard data access operations.
API Endpoints Implemented
GET /api/vehicles
Description: Retrieves a list of all vehicles.
GET /api/vehicles/{id}
Description: Retrieves details of a specific vehicle by ID.
POST /api/vehicles
Description: Creates a new vehicle record.
PUT /api/vehicles/{id}
Description: Updates an existing vehicle's details (including Status).
DELETE /api/vehicles/{id}
Description: Deletes a vehicle record from the database.
Database Tables
vehicle: Created automatically via JPA Hibernate ddl-auto. Columns include id, make, model, license_plate, status, year, fuel_type, etc.
4. Frontend Implementation
Pages Created
src/app/dashboard/vehicles/maintenance/page.tsx
 (Main Module Dashboard)
Components Created
FleetOperationsPage
 (Main logic container)
Integrates Dialog, Table, Card, Tabs, Select from shadcn/ui.
Implements 
handleReport
, 
handleBookVehicle
, 
handleApprove
 logic.
Forms Implemented
New Maintenance Request Form: Captures Vehicle ID, Issue Type, and Description.
Vehicle Booking Details: Captures Dates (Start/End) and Driver Assignment.
Request Details Editor: Allows updating Cost and Downtime for existing requests.
API Integrations
src/services/vehicleService.ts
: Defined client-side service for communicating with the backend (methods: 
getAll
, 
getById
, 
create
, 
update
, 
delete
).
Note: Currently, the UI components utilize Mock Data/Local Storage for demonstration purposes, while this service stands ready for full integration.
5. API Integration
Frontend File: 
src/services/vehicleService.ts
Endpoint: GET /api/vehicles
Purpose: Fetch all vehicles
Frontend File: 
src/services/vehicleService.ts
Endpoint: GET /api/vehicles/{id}
Purpose: Fetch single vehicle details
Frontend File: 
src/services/vehicleService.ts
Endpoint: POST /api/vehicles
Purpose: Create new vehicle
Frontend File: 
src/services/vehicleService.ts
Endpoint: PUT /api/vehicles/{id}
Purpose: Update vehicle status/details
Frontend File: 
src/services/vehicleService.ts
Endpoint: DELETE /api/vehicles/{id}
Purpose: Remove vehicle
6. Database Design
Tables Created
vehicle
Fields Defined
id (Primary Key, Integer, Auto-increment)
licensePlate (String, Unique)
status (String - Core field for Maintenance/Rentals logic)
make (String)
model (String)
category (String)
fuelType (String)
fuelLevel (String)
year (Integer)
currentOdometer (Double)
lastServiceDate (LocalDate)
7. Folder Structure (Only My Module Files)
bash
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
8. Setup Instructions
Backend Setup
Navigate to backend/.
Ensure PostgreSQL is running and configured in application.properties.
Run the application:
bash
./mvnw spring-boot:run
Server starts at http://localhost:8080.
Frontend Setup
Navigate to frontend/.
Install dependencies:
bash
npm install
Run the development server:
bash
npm run dev
Access the module at: http://localhost:3000/dashboard/vehicles/maintenance
9. Current Status
✅ Frontend UI: Fully implemented with responsive design and interactive components.
✅ Frontend Logic: Simulation of Requests and Bookings using Mock Data and Local Storage is fully functional.
✅ Backend API: Complete CRUD endpoints are implemented and tested.
✅ Database: Entity mapping and schema generation are correct.
⚠️ Integration: Frontend currently displays Mock Data; 
vehicleService.ts
 is implemented but not yet hooked into the Dashboard UI state.
10. Author Contribution Statement
This README file and the features described herein reflect only the specific contributions made by me for the Vehicle Maintenance and Rentals module. It does not claim credit for authentication, user management, or other VFMS modules developed by other team members.
