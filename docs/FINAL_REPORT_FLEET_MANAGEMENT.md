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
- Removed duplicate old dashboard route files for fleet pages.

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
- Added filename sanitization for uploaded documents.
- Blocked unsafe file download paths.
- Added odometer support through vehicle DTOs and service mapping.
- Added `INSPECTION_REPAIR` maintenance type.
- Prevented duplicate open maintenance requests for the same vehicle.
- Prevented overlapping active rental periods for the same rented plate number.
- Added backend rental plate number max-length validation.
- Removed duplicate/overlapping driver service request flow from this module scope.

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
- Rental status remains separate:
  - `ACTIVE`
  - `RETURNED`
  - `CLOSED`
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
- Driver sidebar does not show fleet module pages.

## Remaining Team-Level Notes

- Full project authorization for non-fleet legacy APIs should be handled by the team member responsible for authentication/security integration.
- Trip Scheduling should handle trip date/time conflicts and vehicle double booking.
- Final deployment environment values should be configured through environment variables.
