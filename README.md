# Vehicle Maintenance & Rentals Module (VFMS)

## 1) Overview
This module handles **vehicle maintenance** and **vehicle rentals** inside the Vehicle Fleet Management System (VFMS). It supports:
- Maintenance requests + approvals + history
- Tracking maintenance **costs** and **vehicle downtime**
- Recording **vehicle rentals**, rental costs, and related trips :contentReference[oaicite:0]{index=0}

## 2) Who uses this module (Roles)
- **System User (District/Head Office):** create/edit requests, record rentals, schedule trips
- **Authorized User (Approver):** approve/reject maintenance (and booking) requests
- **Driver:** view assigned trip details
- **Administrator:** manage users, configurations, and settings :contentReference[oaicite:1]{index=1}

## 3) Main Features

### A) Maintenance Requests
Users can:
- Create a maintenance request
- Edit/update it (until submitted)
- Submit for approval
- Approver can **Approve / Reject**
- Close the request when done :contentReference[oaicite:2]{index=2}

**Request status flow**
`New → Submitted → Approved/Rejected → Closed` :contentReference[oaicite:3]{index=3}

**Attachments**
- Upload documents such as **quotations** and **invoices** (store file metadata + link/path) :contentReference[oaicite:4]{index=4}

**Downtime + cost tracking**
- Record repair start/end dates (or workshop in/out) to calculate downtime
- Record cost breakdown (parts/labour/total) and vendor/workshop details :contentReference[oaicite:5]{index=5}

---

### B) Rentals
Users can record:
- Rental vehicle/provider details
- Rental period (start/end)
- Cost (daily/monthly/total)
- Link rental to a trip (if your system records trips) :contentReference[oaicite:6]{index=6}

## 4) Suggested Data Model (Simple)
> You can adjust names/fields to match your team database style.

### Tables / Entities
**Vehicle**
- vehicleId, plateNo, type, model, status (Active / UnderMaintenance / Rented / etc.)

**MaintenanceRequest**
- requestId, vehicleId
- title, description, priority
- status (New/Submitted/Approved/Rejected/Closed)
- createdBy, createdAt, updatedAt
- approverId, approvedAt, rejectionReason
- expectedStartDate, actualStartDate, actualEndDate
- downtimeHours (can be calculated)
- workshopName, vendorContact

**MaintenanceCost**
- costId, requestId
- partsCost, labourCost, otherCost, totalCost
- invoiceNo, paidDate

**MaintenanceDocument**
- docId, requestId
- type (Quotation/Invoice/Other)
- fileName, fileUrl/path, uploadedAt, uploadedBy

**Rental**
- rentalId, vehicleId (nullable if rental is “external vehicle”)
- providerName, providerContact
- startDate, endDate
- costType (Daily/Monthly/Fixed), rate, totalCost
- notes
- linkedTripId (optional)

## 5) API Endpoints (Recommended)
> REST style examples (adjust to your team’s route conventions).

### Maintenance
- `POST /api/maintenance/requests` → create request (status = New)
- `PUT /api/maintenance/requests/{id}` → edit request (only if New)
- `POST /api/maintenance/requests/{id}/submit` → New → Submitted
- `POST /api/maintenance/requests/{id}/approve` → Submitted → Approved
- `POST /api/maintenance/requests/{id}/reject` → Submitted → Rejected (+ reason)
- `POST /api/maintenance/requests/{id}/close` → Approved/Rejected → Closed
- `POST /api/maintenance/requests/{id}/documents` → upload quotation/invoice
- `GET  /api/maintenance/requests?status=&vehicleId=&dateFrom=&dateTo=` → list/filter
- `GET  /api/maintenance/requests/{id}` → request details (costs + docs)

### Rentals
- `POST /api/rentals` → record rental
- `PUT  /api/rentals/{id}` → update rental
- `GET  /api/rentals?vehicleId=&dateFrom=&dateTo=` → list/filter
- `GET  /api/rentals/{id}` → rental details

## 6) Business Rules (Easy)
- Only **System User** can create/edit/submit maintenance requests and record rentals. :contentReference[oaicite:7]{index=7}
- Only **Approver** can approve/reject submitted requests. :contentReference[oaicite:8]{index=8}
- Request can be edited only when status = **New**.
- Documents allowed: quotation/invoice/other. :contentReference[oaicite:9]{index=9}
- Downtime should be calculated from maintenance start/end timestamps (or stored if needed). :contentReference[oaicite:10]{index=10}

## 7) Tech Stack Assumption (From project doc)
Suggested stack for the whole VFMS:
- Frontend: **Next.js**, Zustand, Tailwind + shadcn/ui, React Hook Form + Zod
- Backend: **Java 21 + Spring Boot**, REST API, JWT/OAuth
- File handling includes tools for PDFs/images :contentReference[oaicite:11]{index=11}

## 8) Suggested Folder Structure (Example)

### Backend (Spring Boot)
vfms-backend/
src/main/java/.../maintenance/
controller/
service/
repository/
model/
dto/
src/main/java/.../rentals/
controller/
service/
repository/
model/
dto/


### Frontend (Next.js)
vfms-frontend/
app/
maintenance/
requests/
approvals/
history/
rentals/
create/
list/
components/
lib/api/


## 9) Testing Checklist (Minimum)
- Create → Submit → Approve → Close flow
- Create → Submit → Reject flow (+ rejection reason)
- Upload quotation/invoice and ensure request can display attachments
- Downtime calculation checks (start/end)
- Rental create/update/list filters

## 10) Module Owner Notes (For Integration)
- Expose summary data to Reporting module:
  - Total maintenance cost per vehicle/month
  - Total downtime per vehicle/month
  - Rental costs per period
- Keep request status changes auditable (store timestamps + userId) :contentReference[oaicite:12]{index=12}

