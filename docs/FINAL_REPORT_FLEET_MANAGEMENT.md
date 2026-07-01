# Fleet Management Module Change Summary

Owner: Abhinaya
Module: Vehicle Management, Maintenance Management, Rentals, Vendors

## Purpose

This document records the final cleanup and improvement work completed for the Fleet Management module so the team can track what changed before final submission.

## Final Role Decisions

- Administrator manages master data:
  - Add, edit, and retire company-owned vehicles.
  - Add, edit, activate, and deactivate vendors.
  - View and manage maintenance and rental records.
- System User / Staff manages operational work:
  - View vehicles.
  - Create, edit, submit, and close maintenance requests.
  - Create and manage rental records.
  - Select active vendors during rental creation.
- Approver handles approval work:
  - View vehicles.
  - View maintenance requests.
  - Approve or reject submitted maintenance requests.
  - View rentals only where needed.
- Driver has no direct access to Fleet Management pages:
  - No vehicles, maintenance, rentals, or vendors in the driver sidebar.

## Frontend Changes

- Cleaned fleet navigation so active fleet pages are under:
  - `/dashboards/fleet/vehicles`
  - `/dashboards/fleet/maintenance`
  - `/dashboards/fleet/rentals`
  - `/dashboards/fleet/vendors`
- Protected direct fleet URLs using role-based guards.
- Removed driver-facing fleet links from navigation.
- Made vehicle add/edit/retire UI Admin-only.
- Made vendor add/edit/deactivate UI Admin-only.
- Added clearer fleet sidebar names for each role.
- Added odometer field to vehicle forms and vehicle details.
- Fixed retired vehicle filtering so retired vehicles appear only in the retired/archive filter.
- Added Zod + React Hook Form validation for fleet forms:
  - Vehicle form
  - Vendor form
  - Maintenance form
  - Rental form
- Unified plate number guidance across vehicle and rental forms using the same example:
  - `e.g. CP-NBM-4567`
- Improved vendor error display so backend validation messages are shown clearly.
- Improved maintenance/rental document handling:
  - Shared file dropzone UI.
  - Existing uploaded document names are shown.
  - Documents open through authenticated requests.
- Added support for private Supabase document references:
  - Old local document links still open through authenticated backend requests.
  - New `supabase://...` document references open through backend-created signed URLs.
- Removed duplicate old dashboard route files for fleet pages.
- Added display-only trip usage status for fleet pages:
  - Company vehicles show `IN TRIP USE` when the Trip module reports that the available vehicle is assigned to an approved/confirmed/ongoing trip.
  - Active rentals show `In Trip Use` when the Trip module reports that the rental is assigned to an approved/confirmed/ongoing trip.
  - This is a derived UI indicator only; it does not change vehicle or rental database statuses.

## Backend Changes

- Added role-based API protection for fleet endpoints:
  - Vehicles
  - Maintenance
  - Rentals
  - Vendors
- Made vehicle create/update/retire Admin-only.
- Kept vehicle read access for Admin, System User, and Approver.
- Made vendor management Admin-only.
- Kept active vendor selection available for staff rental flow.
- Added safe file upload/download handling for maintenance and rental documents.
- Added private Supabase Object Storage support for new fleet PDFs:
  - Maintenance quotation PDFs.
  - Maintenance invoice PDFs.
  - Rental agreement PDFs.
  - Rental invoice PDFs.
- Kept old local file-serving endpoints so previously uploaded local documents remain viewable.
- Added signed access endpoints for private fleet documents:
  - `/api/maintenance/files/access`
  - `/api/rentals/files/access`
- Added filename sanitization and filename length capping for uploaded documents.
- Blocked unsafe file download paths for local legacy files.
- Added odometer support through vehicle DTOs and service mapping.
- Added `INSPECTION_REPAIR` maintenance type.
- Prevented duplicate open maintenance requests for the same vehicle.
- Prevented overlapping active rental periods for the same rented plate number.
- Added backend rental plate number max-length validation.
- Removed duplicate/overlapping driver service request flow from this module scope.

## Storage Configuration

Fleet maintenance and rental PDFs now use the project-standard private Supabase Object Storage pattern.

Required backend environment variables:

```properties
SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1
SUPABASE_SERVICE_KEY=your-service-role-key
FLEET_SUPABASE_STORAGE_BUCKET=fleet-documents
```

Safety notes:

- Real Supabase service-role keys must be kept only in backend `.env` or deployment environment variables.
- Real keys must never be committed to GitHub, frontend code, test files, or documentation.
- The `fleet-documents` bucket should be created manually in Supabase as a private bucket.
- Existing local document records continue to work, so no migration is required for old uploaded PDFs.

## Common Project Changes

These changes were completed as shared project cleanup because they affected navigation, routing, configuration, or security across multiple modules.

- Updated the admin dashboard layout so admin report pages keep the same sidebar consistently.
- Removed duplicate old `/dashboard/...` route pages and kept the organized `/dashboards/...` route structure.
- Added redirects for old dashboard URLs so existing links still land on the correct new pages.
- Cleaned dashboard/sidebar role handling so modules appear under the correct user role.
- Removed unused duplicate role-context files and kept the active role context implementation.
- Removed unused backup/unwanted files:
  - `frontend/src/middleware.ts.bak`
  - `.agents`
- Kept the active Next.js proxy file as the project routing/auth proxy entry.
- Replaced hardcoded frontend backend URLs with shared API/base URL helpers where this affected the cleanup scope.
- Removed unsafe controller-level wildcard CORS from cleaned controllers and relied on centralized CORS configuration.
- Removed the trip development password-reset endpoint.
- Fixed backend tests to use the H2 test profile safely instead of timing out against the real Supabase database.
- Updated stale SecurityConfig comments so fleet API protection is documented correctly.
- Ran whole-project verification after cleanup:
  - Frontend tests
  - Frontend production build
  - Backend tests

## Business Rule Decisions

- Maintenance requests are created manually by System User / Staff.
- Driver service requests are not required for this module.
- Driver infractions are not used by this module.
- Company-owned vehicles and rented vehicles stay separate.
- Vehicle status remains:
  - `AVAILABLE`
  - `UNDER_MAINTENANCE`
  - `RETIRED`
- `IN TRIP USE` is not stored as a vehicle status. It is a display-only operational indicator derived from Trip Scheduling data.
- Rental status remains separate:
  - `ACTIVE`
  - `RETURNED`
  - `CLOSED`
- `In Trip Use` for rentals is not stored as a rental status. It is a display-only operational indicator derived from Trip Scheduling data.
- Trip double booking and on-trip availability are Trip Scheduling module responsibilities.
- Renting is allowed even if company vehicles exist, because a rented vehicle may be needed for capacity, purpose, suitability, or timing reasons.

## Verification Completed

- Frontend unit tests passed:
  - `npm run test`
  - 25 tests passed.
- Frontend production build passed:
  - `npm run build`
  - Required the Next/Turbopack TLS flag for Google Fonts in this local environment.
- Backend tests passed:
  - `mvn test`
  - 109 tests passed.
- Backend compile passed after the Supabase storage update:
  - `mvn -DskipTests compile`
- Targeted frontend lint passed for changed fleet document/status files.
- Browser console check completed with authenticated Admin session:
  - Vehicles list/add/detail/edit
  - Maintenance list/create/detail/edit
  - Rentals list/create/detail/edit
  - Vendors list/add/detail/edit
  - No console errors, runtime exceptions, or failed HTTP errors found.

## Manual Checks Completed

- Admin can add, edit, and retire vehicles.
- System User can view vehicles but cannot add company vehicles.
- Admin can add, edit, and deactivate vendors.
- System User sees/selects active vendors only.
- Maintenance request creation works.
- Maintenance submit, approve/reject, close flow works.
- Maintenance quotation and invoice upload/view flow works.
- Rental create, edit, return, close flow works.
- Rental agreement and invoice upload/view flow works.
- New fleet document uploads are stored in private Supabase Object Storage when the required backend environment variables are configured.
- Existing local fleet document links remain viewable.
- Vehicle and rental pages show derived trip-use indicators without changing stored statuses.
- Driver sidebar does not show fleet module pages.

## Remaining Team-Level Notes

- Full project authorization for non-fleet legacy APIs should be handled by the team member responsible for authentication/security integration.
- Trip Scheduling should handle trip date/time conflicts and vehicle double booking.
- Final deployment environment values should be configured through environment variables.

## Final Module Score Estimate

Current Fleet Management module score estimate: **9.5 / 10**.

Reason:

- Core vehicle, maintenance, rental, and vendor workflows are complete.
- Role rules are clearly separated.
- Direct page and backend access are protected for the fleet module.
- Duplicate fleet routes and overlapping driver service-request scope were cleaned.
- Maintenance/rental documents now follow private object-storage practice.
- Trip-use visibility is integrated safely as a derived display status.

Remaining 0.5 depends on final team-level deployment checks:

- Supabase private bucket exists in the deployment project.
- Required environment variables are configured outside source control.
- Trip module keeps the active vehicle endpoint stable.
- Full-team regression testing is completed after all branches are merged.
