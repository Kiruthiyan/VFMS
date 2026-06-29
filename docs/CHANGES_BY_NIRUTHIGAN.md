# Trip Management System Enhancements

This document compiles the comprehensive list of features, business rules, validations, and user interface modifications implemented in the Vehicle Fleet Management System (VFMS) repository.

---

## 1. Dynamic Route Planning & Free Start Locations
* **Customizable Start Location:** Removed the hardcoded start point (`"Colombo Office, Sri Lanka"`) from the trip request itinerary form. The requester can now input and edit any start location freely.
* **Geocoding Cleanup:** Cleared the static geocoding cache in the map components, allowing real-time addresses to map dynamically without hardcoded fallback coordinates.
* **Database Length Expansion:** Refactored the `destination` field mapping in [TripRequest.java](file:///c:/Users/Niruthigan/Desktop/VFMS/backend/src/main/java/com/vfms/trip/entity/TripRequest.java) to use `columnDefinition = "TEXT"`. This supports long, concatenated address strings containing multiple stops without triggering database `varying(255)` overflow errors.

## 2. Strict Departure Time Alignments & Auto-Expiration
* **30-Minute Startup Window:** Drivers are restricted from starting a trip unless the current local time is within a **30-minute range** (before or after) of the scheduled departure time. Starting outside this window throws a `"Trip cannot be started"` validation error.
* **Expired Status Lifecycle:** Introduced the `EXPIRED` status in [TripStatus.java](file:///c:/Users/Niruthigan/Desktop/VFMS/backend/src/main/java/com/vfms/trip/enums/TripStatus.java). 
* **Self-Healing Checker:** If a trip remains unstarted 30 minutes after its scheduled departure time, its status is updated to `EXPIRED`. This check is run dynamically whenever trip details are fetched or listed, preventing expired trips from being started.

## 3. Timeline Deviation Reporting
* **Time Tracking Fields:** Added `driver_timeline_reason` and `staff_timeline_reason` text columns to the trip entity.
* **Driver End-Trip Reason Popup:** If a driver completes an ongoing trip more than 30 minutes early or late relative to the planned return time, a popup dialog box is shown requesting them to provide a reason for the timeline change.
* **Staff Justification in Feedback:** If a trip actual end time deviates by more than 30 minutes, staff members are prompted to provide a timeline justification reason in the driver rating/feedback form.
* **Read-only Presentation:** Timeline discrepancy reasons submitted by drivers and staff are displayed in detailed read-only performance cards on the trip page.

## 4. Sequential Stop Arrival Logs
* **Arrival Logging Endpoint:** Created a patch endpoint `/api/trips/{id}/log-stop` in [TripRequestController.java](file:///c:/Users/Niruthigan/Desktop/VFMS/backend/src/main/java/com/vfms/trip/controller/TripRequestController.java).
* **Sequential UI Action Buttons:** In the itinerary timeline on the trip details page, drivers are presented with a `"Log Arrival at Stop X"` button. This button is presented sequentially for intermediate stops.
* **Arrival Validation:** The driver is blocked from ending/completing the trip until they have sequentially logged arrival timestamps for all intermediate stops.

## 5. Prevent Driver & Vehicle Double-Booking
* **Conflict Queries:** Implemented `findConflictingVehicleBookings` and `findConflictingDriverBookings` in [TripRequestRepository.java](file:///c:/Users/Niruthigan/Desktop/VFMS/backend/src/main/java/com/vfms/trip/repository/TripRequestRepository.java) using interval overlap math (`departureTime < :returnTime AND returnTime > :departureTime`).
* **Conflict Prevention:** During the trip approval stage, driver/vehicle assignments are checked against other concurrent active trips (`APPROVED`, `DRIVER_CONFIRMED`, `ONGOING`). If an overlap exists, assignment is rejected, throwing a validation exception.

## 6. Active Vehicles Endpoint
* **Tracking API:** Implemented `GET /api/trips/active-vehicle-ids` returning a list of vehicle IDs currently active on approved, confirmed, or ongoing trips. This allows the system to reflect "On Trip" badges dynamically.

## 7. Union-Based Vehicle Selection Dropdown
* **Multi-table Query:** Modified `getAvailableVehicles()` to return both owned vehicles (from the `vehicles` table where `status = 'AVAILABLE'`) and active rental vehicles (from the `rental_records` table where `status = 'ACTIVE'`).
* **ID Offset mapping:** Mapped rental vehicle IDs to a `100000000L` offset, preventing primary key overlaps.
* **Option Display formatting:** Formatted the dropdown options on the review/approval page to cleanly output `[brand/type] — [plate_number]`.

## 8. Driver Dropdown Selection Filter
* **Readiness Query:** Refactored `getAvailableDrivers()` to only select drivers who have valid driving licenses (`readiness_license_valid = true`).
* **Option Display formatting:** Formatted driver dropdown option labels to display `{d.employeeId} — {d.firstName}`.

## 9. Trip Cancellation Reason Modal
* **Optional Request Body:** Updated the `/cancel` endpoint to make the request body optional, preventing errors if no notes are provided.
* **Cancellation Reason Modal:** Built a popup dialog box on the trip page, prompting the user for a cancellation reason before finalizing, which is saved in `approvalNotes`.
