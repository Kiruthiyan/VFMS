# Vehicle Fleet Management System (VFMS)

![VFMS Banner](public/hero-poster.jpg)

> **Focus:** Fuel Management Module & Core Infrastructure
> **Role:** Student B Implementation

## 📖 Project Overview
The **Vehicle Fleet Management System (VFMS)** is an enterprise-grade solution designed to automate and streamline vehicle-related operations. This repository specifically hosts the **Fuel Management Module**, a critical component for tracking fuel consumption, monitoring costs, and ensuring accurate mileage reporting across the fleet.

### 🎯 Key Objectives
- **Automate Fuel Tracking:** Digitize manual fuel entry logs.
- **Cost Control:** Monitor fuel expenses per vehicle and driver.
- **Efficiency Analysis:** Calculate mileage and identify high-consumption vehicles.

---

## 🏗️ System Architecture

### 📂 Project Structure
A high-level view of the current project structure, focused on the implemented modules:

```text
e:\SoftWare Project\VFMS\
├── backend/ (Spring Boot 3.x)
│   ├── src/main/java/com/vfms/
│   │   ├── admin/      # Admin Configurations
│   │   ├── auth/       # JWT Authentication & Security
│   │   ├── fuel/       # [Student B] Fuel Management Logic
│   │   │   ├── controller/ # API Endpoints
│   │   │   └── model/      # Database Entities (FuelRecord)
│   │   └── config/     # Global App Config
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/ (Next.js 14)
    ├── src/app/
    │   ├── admin/
    │   │   ├── fuel/   # Fuel Management Admin UI
    │   │   └── users/  # User Management
    │   └── dashboard/
    │       ├── fuel/   # Fuel Analytics Dashboard
    │       └── users/  # User & Staff Views
    └── public/
```

---

## ⛽ Fuel Management Module (Student B)

This module is the core focus of this branch, providing end-to-end functionality for managing fuel data.

### 🔌 Backend API (`/api/fuel`)
The backend exposes a RESTful API for handling fuel records.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/fuel` | Retrieve a list of all fuel transaction records. |
| `POST` | `/api/fuel` | Register a new fuel transaction (quantity, cost, mileage). |
| `GET` | `/api/fuel/vehicle/{id}` | Fetch fuel history for a specific vehicle. |

#### Data Model (`FuelRecord`)
The core entity tracking fuel data includes:
- **Vehicle:** Link to the specific vehicle refueled.
- **Driver:** The driver responsible for the transaction.
- **Quantity:** Amount of fuel in liters.
- **Cost:** Total cost of the transaction.
- **Mileage:** Odometer reading at the time of refueling.
- **Date:** Transaction date.

### 💻 Frontend Features
- **Admin Panel (`/admin/fuel`):**
    - comprehensive data table of all fuel logs.
    - specialized forms for adding new records with validation.
    - Edit and Delete capabilities for authorized admins.
- **User Dashboard (`/dashboard/fuel`):**
    - Analytical views for quick insights.
    - Personal fuel history for logged-in drivers.

---

## 🛠️ Technology Stack

### Backend
- **Language:** Java 17
- **Framework:** Spring Boot 3.2.x
- **Database:** PostgreSQL
- **ORM:** Hibernate / Spring Data JPA
- **Security:** Spring Security + JWT
- **Build Tool:** Maven

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **State:** Zustand
- **Forms:** React Hook Form + Zod

---

## 🚀 Getting Started

### 1️⃣ Backend Setup
```bash
cd backend
# Update database credentials in src/main/resources/application.properties
./mvnw spring-boot:run
```

### 2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:3000`.

---

## 👥 User Roles
- **Administrator:** Full access to system settings, user management, and all fuel records.
- **Approver:** Can review and validate fuel entries.
- **Driver:** specific access to view their own vehicle assignments and fuel history.

---

> Verified by **Student B** | Branch: `kiruthiyan`