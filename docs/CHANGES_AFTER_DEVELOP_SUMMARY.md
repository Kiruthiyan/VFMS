Changes Made After Pulling from develop
=======================================

Branch: test18/Kavishanth
Compared against: develop

This file summarizes the main changes made in this branch after pulling from the develop branch.


1. DSM backend consolidation
----------------------------

- Consolidated many Driver and Staff Management backend files into a smaller structure.
- Replaced multiple old driver controllers with consolidated driver controller logic.
- Replaced many individual DSM DTO files with:
  - DriverRequests.java
  - DriverResponses.java
- Replaced separate driver resource entities with a consolidated DriverAggregate model.
- Added DriverRepository as the main aggregate-backed repository/facade.
- Added focused services for credentials, records, assessment, readiness, and driver profile logic.
- Removed unused DSM files such as old controllers, old DTOs, old repositories, old service classes, and DuplicateResourceException.
- Removed old StaffController and StaffService APIs that were no longer used.


2. Driver database/schema cleanup
---------------------------------

- Updated DSM schema scripts to match the current project state.
- Removed obsolete driver_service_requests references.
- Added Flyway migrations for driver-table cleanup and consolidation:
  - V21__drop_unused_driver_tables.sql
  - V22__consolidate_driver_tables.sql
  - V23__remove_driver_compatibility_views.sql
- Added support for storing driver subresources inside the consolidated drivers table.


3. Supabase Object Storage changes
----------------------------------

- Driver profile pictures now use private Supabase Object Storage.
- Driver license and other driver document uploads now use private Supabase Object Storage.
- Staff profile pictures now use private Supabase Object Storage.
- Added backend storage services and properties for Driver and Staff upload handling.
- Added signed URL generation for viewing uploaded profile pictures/documents.
- Kept metadata in the database while storing the actual files in Supabase Storage.
- Added storage environment settings to application-dev.properties and .env.example.


4. Driver dashboard frontend changes
------------------------------------

- Improved Driver Dashboard Profile page layout and visual organization.
- Added large profile-picture preview modal with close button.
- Moved certification submission into the Driver Profile page.
- Added infraction warning card to the Driver Profile page.
- Moved leave request feature into a dedicated Driver Dashboard Leave Request page.
- Added leave request filters and counts:
  - All
  - Pending
  - Approved
  - Rejected
- Changed Delete button to Cancel Request on the leave request page.
- Simplified document upload options to:
  - License
  - Other
- Removed old/unwanted driver dashboard pages and sidebar entries.


5. Staff dashboard frontend changes
-----------------------------------

- Improved Staff Dashboard Profile page layout and visual organization.
- Added large profile-picture preview modal with close button.
- Removed the controlled-access notice from the Staff Profile page.
- Moved the Staff Profile navigation item to the bottom of the Staff sidebar.


6. Approver dashboard driver changes
------------------------------------

- Updated Drivers page with filters:
  - All Drivers
  - Available Drivers
  - Unavailable Drivers
- Moved Assignment Readiness summary behavior into the Drivers page.
- Removed the old Assignment Readiness page.
- Removed unwanted Back/Approver dashboard buttons where requested.
- Added driver rating display support in the Drivers table and driver profile.
- Added Feedbacks tab to the driver profile.
- Added profile-picture preview modal in Approver driver profile overview.
- Updated Licenses tab to show only uploaded license documents.
- Updated Documents tab to show only Other documents uploaded by the driver.
- Added/updated Infractions page:
  - Log Infraction form moved to Infractions page.
  - Added Select Driver field.
  - Added status column.
  - Added All / Resolved / In progress filters.
  - Replaced icon button with Resolved button.
  - Resolved infractions no longer show warning cards in the driver profile.


7. Route and component cleanup
------------------------------

- Removed unused legacy driver route files, including old readiness, eligibility, availability, qualification, overview, certs, documents, infractions, licenses, and trips route pages.
- Removed unused driver portal shell/sidebar/header components.
- Removed unused driver qualification, infraction, and leave request dialog components.
- Kept the current active driver detail page at:
  - frontend/src/app/drivers/[id]/page.tsx


8. Tests added or updated
-------------------------

- Added or updated DSM tests for:
  - Driver aggregate persistence
  - Driver aggregate JSON compatibility
  - Driver endpoint contract behavior
  - Driver expiry scheduler behavior
  - Driver Supabase storage behavior
- Updated existing DSM-related tests to match the consolidated backend structure.
- Fixed the GitGuardian hardcoded-password finding in DriverAggregatePersistenceTest by using generated test password values.


9. Documentation updates
------------------------

- Updated the Driver and Staff Management final report.
- Updated DSM database/schema documentation.
- Updated environment examples for Driver and Staff Supabase Storage configuration.


10. Important notes
-------------------

- Supabase private buckets must exist manually before uploads work.
- Required storage configuration includes:
  - SUPABASE_STORAGE_URL
  - SUPABASE_SERVICE_KEY
  - DRIVER_SUPABASE_STORAGE_BUCKET
  - STAFF_SUPABASE_STORAGE_BUCKET
- The old GitGuardian-flagged commit was removed from the remote PR branch history.
- Current branch history contains one clean commit above develop.

