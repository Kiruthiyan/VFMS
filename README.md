> ⚠️ **FINAL SUBMISSION BRANCH (Abhinaya J. — Vehicle Maintenance and Rental(VMR) Module):** `feature/vmr-module-finalization`
# FleetPro - Vehicle Fleet Management System (VFMS)

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-cyan)

> **Module Focus:** Vehicle Maintenance & Rentals Module (Student A)
> **Status:** Complete

## 📖 Project Overview

**FleetPro** is an enterprise-grade Vehicle Fleet Management System designed to streamline logistics, reduce operational costs, and enhance fleet visibility for large organizations.

This repository hosts the **Vehicle Maintenance & Rentals Module**, responsible for:
- **Vehicle Registry:** Maintaining a complete, auditable record of the organization's fleet.
- **Maintenance Workflow:** Managing the full lifecycle of a maintenance request from creation to closure.
- **Rental Management:** Tracking vehicles rented from external vendors to supplement the fleet.
- **Cost Tracking:** Recording maintenance and rental costs for financial reporting.
- **Secure Access:** Role-Based Access Control (RBAC) ensuring only authorized users can approve or close records.

## ✨ Key Features

### 🚗 Vehicle Management (Core)
- **Vehicle Registry:** Add, edit, and soft-retire fleet vehicles with full audit history.
- **Status Tracking:** Real-time vehicle status — `AVAILABLE`, `UNDER_MAINTENANCE`, `ON_TRIP`, `RETIRED`.
- **Fleet Overview:** Filterable list view of all vehicles by status and type.
- **Soft Deletion:** Retired vehicles are deactivated, not deleted, preserving historical data integrity.

### 🔧 Maintenance Management
- **Full Request Lifecycle:** Create → Submit → Approve/Reject → Close with strict status transitions.
- **Document Uploads:** Attach quotation and invoice files at each stage of the workflow.
- **Cost Recording:** Track estimated and actual repair costs per maintenance request.
- **Audit Trail:** All status changes are timestamped and stored permanently.
- **Workflow Integrity:** Closed or rejected requests are frozen — they cannot be accidentally edited.

### 🚘 Rental Management
- **Vendor Rentals:** Record vehicles rented from external vendors to supplement the fleet.
- **Rental Lifecycle:** Track rentals from `ACTIVE` → `RETURNED` → `CLOSED`.
- **Auto Cost Calculation:** Total rental cost is automatically computed based on daily rate × actual days used.
- **Minimum Billing:** Enforces a minimum 1-day billing period to protect the organization from billing errors.
- **Document Management:** Attach rental agreements and invoices to each rental record.

### 🏢 Vendor Management
- **Vendor Registry:** Maintain a list of approved external vendors for vehicle rentals.
- **Soft Deactivation:** Deactivated vendors are hidden from new rentals but preserved in historical records.

### 🔐 Role-Based Access Control (RBAC)
| Action | System User | Approver | Admin | Driver |
|---|---|---|---|---|
| Create / Edit Requests | ✅ | ❌ | ✅ | ❌ |
| Submit Requests | ✅ | ❌ | ✅ | ❌ |
| Approve / Reject Requests | ❌ | ✅ | ✅ | ❌ |
| Close Requests & Record Costs | ❌ | ✅ | ✅ | ❌ |
| Upload Documents | ✅ | ✅ | ✅ | ❌ |
| Manage Vendors | ❌ | ❌ | ✅ | ❌ |
| View All Records | ✅ | ✅ | ✅ | ✅ |
| View Vehicle Details | ✅ | ✅ | ✅ | ✅ |

## 🏗️ Technical Architecture

### Backend (Spring Boot)
- **Framework:** Spring Boot 3.4.0 | Java 21
- **Database:** PostgreSQL hosted on Supabase (JPA/Hibernate)
- **Security:** Spring Security 6 + Stateless JWT
- **Architecture:** Layered REST API — Controller → Service → Repository
- **Error Handling:** Global Exception Handler (`@RestControllerAdvice`) with domain-specific exceptions (`ResourceNotFoundException`, `IllegalStateException`)
- **Validation:** Bean Validation (`@NotBlank`, `@NotNull`) on all request DTOs
- **Configuration:** Environment variables loaded via `spring-dotenv` from a `.env` file — no hardcoded credentials

### Frontend (Next.js)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Forms:** React Hook Form + Zod Validation
- **API Client:** Axios with centralized service layer

## 📂 Project Structure

```text
VFMS-final/
├── backend/                        # Java Spring Boot Backend
│   ├── src/main/java/com/vfms/
│   │   ├── vehicle/                # Vehicle module (Entity, Controller, Service, Repository)
│   │   ├── maintenance/            # Maintenance module (Request lifecycle, Document upload)
│   │   ├── rental/                 # Rental & Vendor modules
│   │   ├── common/                 # Shared: Global Exception Handler, Custom Exceptions, DTOs
│   │   └── config/                 # Security (JWT), CORS configuration
│   ├── src/test/java/com/vfms/     # Unit Tests (JUnit 5 + Mockito)
│   ├── .env                        # Local environment variables (not committed to Git)
│   └── .env.example                # Template for setting up local environment
│
└── frontend/                       # Next.js Frontend
    ├── src/app/dashboard/
    │   ├── vehicles/               # Vehicle list and detail pages
    │   ├── maintenance/            # Maintenance request list and detail pages
    │   └── rentals/                # Rental list and detail pages
    └── src/components/             # Reusable UI Components (Sidebar, Topbar, Tables)
```

## 🚀 Getting Started

### Prerequisites
- **Java JDK 21+**
- **Node.js 18+**
- **Maven** (optional, wrapper included)
- A **PostgreSQL** database (local or cloud — this project uses Supabase)

### 1️⃣ Backend Setup

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Create your environment file by copying the example:
    ```bash
    cp .env.example .env
    ```
3. Open `.env` and fill in your database credentials.

4. Run the application (the `.env` file is loaded automatically):
    ```bash
    ./mvnw clean spring-boot:run
    ```
    *The server will start on `http://localhost:8080`.*

### 2️⃣ Frontend Setup

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run the development server:
    ```bash
    npm run dev
    ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

### Backend Unit Tests
17 unit tests covering the core business logic of all four services, completely isolated from the database using **Mockito**.

Run the tests:
```bash
cd backend
./mvnw test
```

### Test Coverage
| Test Class | Positive Cases | Negative / Edge Cases |
|---|---|---|
| `VehicleServiceTest` | Add vehicle, Get by ID, Retire vehicle | Duplicate plate number |
| `MaintenanceServiceTest` | Create request, Approve, Close | Vehicle not found, Invalid status jump |
| `RentalServiceTest` | Create rental, Confirm return | Vendor not found, Return on non-active rental |
| `VendorServiceTest` | Add vendor, Toggle active status | Vendor not found |

### Verified User Flows
- [x] Add, Edit, and Retire a Vehicle
- [x] Full Maintenance Lifecycle (New → Submitted → Approved → Closed)
- [x] Document Upload (Quotation & Invoice)
- [x] Full Rental Lifecycle (Active → Returned → Closed)
- [x] Vendor Deactivation (Soft Delete)
- [x] Role-Based UI rendering (System User vs. Approver)

## 📄 License
This project is proprietary software developed for the **Vehicle Fleet Management System (VFMS)** academic requirement.

---
**Developed by:** Abhinaya J. (Vehicle Maintenance & Rentals Module)