# Vehicle Fleet Management System (VFMS)

![VFMS Banner](public/hero-poster.jpg)

> **Status:** Fully Integrated System
> **Branch:** `main` (Merged: Students A, B, C, D, E)

## 📖 Project Overview
The **Vehicle Fleet Management System (VFMS)** is a comprehensive, enterprise-grade solution designed to automate and streamline the entire lifecycle of fleet operations. This unified platform integrates vehicle maintenance, fuel tracking, driver management, trip scheduling, and advanced analytics into a single, cohesive interface.

---

## 🏗️ Modules & Key Features

### 🚗 Vehicle Management (Student A)
*Centralized registry for all fleet assets.*
- **Vehicle Profiles:** Detailed tracking of make, model, VIN, and status.
- **Maintenance Logs:** Schedule services and track repair history.
- **Rentals:** Manage external vehicle rentals and availability.

### ⛽ Fuel Management (Student B)
*Precision tracking of fuel consumption and costs.*
- **Transaction Logs:** Record fuel entries with receipt uploads.
- **Efficiency Analysis:** Monitor MPG/KPL per vehicle.
- **Cost Reports:** Identify high-consumption assets and potential leakage.

### 👮 Driver & Staff Management (Student C)
*Human resource management for the fleet.*
- **Driver Profiles:** Track licenses, certifications, and shift schedules.
- **Performance Scoring:** Monitor safety records and assignments.
- **User Roles:** granular access control for Admins, Approvers, and Drivers.

### 📅 Trip Scheduling & Booking (Student D)
*Seamless dispatching and route planning.*
- **Trip Requests:** Automated booking workflow for staff.
- **Dispatching:** Assign drivers and vehicles based on availability.
- **Route Tracking:** Log trip milestones and odometer readings.

### 📊 Reporting & Analytics (Student E)
*Data-driven insights for decision makers.*
- **Executive Dashboard:** High-level KPIs and fleet health summaries.
- **Custom Reports:** Exportable data for audit and compliance.
- **Visualizations:** Interactive charts for cost, usage, and efficiency trends.

---

## 🛠️ Technology Stack

### Backend
- **Language:** Java 17 / 21
- **Framework:** Spring Boot 3.2.x
- **Database:** PostgreSQL
- **Security:** Spring Security + JWT
- **Build Tool:** Maven

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod

---

## 🚀 Getting Started

### 1️⃣ Backend Setup
```bash
cd backend
# Configure database in src/main/resources/application.properties
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

## 👥 Contributors (Team Breakdown)
- **Student A:** Vehicle Maintenance & Rentals (`origin/Abhinaya-J`)
- **Student B:** Fuel Management (`origin/kiruthiyan`)
- **Student C:** Driver & Staff Management (`origin/Kavishanth-N`)
- **Student D:** Trip Scheduling & Booking (`origin/Niruthigan-P`)
- **Student E:** Reporting & Analytics (`origin/P.-Hephzibah-Peries`)

---

> **VFMS Project** | Full Integration Complete