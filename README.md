# FleetPro - Vehicle Fleet Management System (VFMS)

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-cyan)

![FleetPro Dashboard](https://github.com/user-attachments/assets/placeholder-dashboard-image)
*(Note: Replace with actual hosted image URL or local path if supported by your repo host)*

> **Module Focus:** Fuel Management System (Student B)
> **Status:** Active Development

## 📖 Project Overview

**FleetPro** is an enterprise-grade Vehicle Fleet Management System designed to streamline logistics, reduce operational costs, and enhance fleet visibility.

This repository hosts the **Fuel Management Module**, a specialized component responsible for:
- **Tracking Fuel Consumption:** Digitizing fuel logs for entire fleets.
- **Cost Analytics:** Visualizing standardized fuel costs and identification of inefficiencies.
- **Mileage Monitoring:** Correlating fuel usage with distance traveled.
- **Secure Access:** Role-Based Access Control (RBAC) ensuring data integrity.

## ✨ Key Features

### ⛽ Fuel Management (Core)
- **Digital Fuel Logging:** Drivers or admins can log fuel entries (Volume, Cost, Station, Mileage).
- **Smart Analytics:** Real-time dashboards showing Monthly Spend, Fuel Efficiency (Km/L), and Abnormal Consumption.
- **Vehicle History:** Complete audit trail of every refueling event per vehicle.

### 🔐 Advanced Security
- **JWT Authentication:** Stateless, secure session management.
- **Role-Based Access Control (RBAC):**
    - **Admin:** Full system control.
    - **Approver:** Validate records.
    - **Driver:** View-only access to assigned vehicle data.
    - **System User:** Staff-level access.
- **2-Step OTP Password Reset:** Enhanced security flow (Verify OTP -> Reset Password) via Email.

### 👥 User Management
- **Onboarding Workflow:** Admin-initiated user creation with temporary passwords.
- **Profile Management:** Users can update profiles and avatars.
- **Secure Password Policy:** Enforced complexity and rotation.

## 🏗️ Technical Architecture

### Backend (Spring Boot)
- **Framework:** Spring Boot 3.4.0
- **Database:** PostgreSQL (JPA/Hibernate)
- **Security:** Spring Security 6 + JWT (Phone/Email verification)
- **Architecture:** Monolithic REST API (clean separation of concerns)

### Frontend (Next.js)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI (Radix Primitives)
- **State Management:** React Query + Zustand
- **Forms:** React Hook Form + Zod Validation

## 📂 Project Structure

```text
e:\SoftWare Project\VFMS\
├── backend/                  # Java Spring Boot Backend
│   ├── src/main/java/com/vfms/
│   │   ├── auth/             # Authentication & User Management
│   │   ├── fuel/             # Fuel Module (Controllers, Services, Repos)
│   │   ├── vehicle/          # Vehicle Core Entities
│   │   └── config/           # Global Configurations (CORS, Security)
│   └── src/main/resources/   # App Properties & Email Templates
│
└── frontend/                 # Next.js Frontend
    ├── src/app/
    │   ├── admin/            # Protected Admin Routes (Users, Fuel)
    │   ├── auth/             # Login, Forgot Password, OTP Flows
    │   └── dashboard/        # Role-specific Dashboards
    ├── src/components/       # Reusable UI Components
    └── src/lib/              # API Clients & Utility Functions
```

## 🚀 Getting Started

### Prerequisites
- **Java JDK 21+**
- **Node.js 18+**
- **PostgreSQL** running locally on default port `5432`.
- **Maven** (optional, wrapper included).

### 1️⃣ Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Configure environment variables:
    Use `backend/.env.example` as the source of required keys, then provide the values through your shell, IDE run configuration, or other local environment management tooling.
    ```powershell
    $env:DB_URL="<set-locally>"
    $env:DB_USERNAME="<set-locally>"
    $env:DB_PASSWORD="<set-locally>"
    $env:JWT_SECRET="<set-locally>"
    $env:MAIL_USERNAME="<set-locally>"
    $env:MAIL_PASSWORD="<set-locally>"
    $env:CORS_ALLOWED_ORIGINS="http://localhost:3000"
    ```
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
    *The server will start on `http://localhost:8080`.*

### 2️⃣ Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

### Backend Tests
Run unit and integration tests using Maven:
```bash
cd backend
./mvnw test
```

### Verified User Flows
- [x] **Login/Logout** (JWT valid/invalid)
- [x] **Forgot Password** (Email delivery + OTP Verification)
- [x] **Fuel Entry** (Validation of cost/mileage)
- [x] **User Creation** (Admin only)

## 📄 License
This project is proprietary software developed for the **Vehicle Fleet Management System (VFMS)** academic requirement.

---
**Developed by:** Kiruthiyan (Student B)
