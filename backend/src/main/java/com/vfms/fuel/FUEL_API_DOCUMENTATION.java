package com.vfms.fuel;

/**
 * Fuel Management API – Reference Documentation
 *
 * <p><b>Base Path:</b> {@code /api/v1/fuel}</p>
 *
 * <h2>Overview</h2>
 * <p>This module handles fuel record management with real-time vehicle data
 * fetching from the vehicle API endpoint. All fuel records are stored in
 * Supabase PostgreSQL with relationships to vehicles for data consistency.</p>
 *
 * <h2>CREATE Operations</h2>
 * <ul>
 *   <li><b>POST /api/v1/fuel</b> – Create a new fuel record (multipart/form-data).
 *       Validates vehicle in real-time, calculates total cost, optionally uploads
 *       a receipt, checks for misuse, and updates the vehicle odometer.</li>
 * </ul>
 *
 * <h2>READ Operations</h2>
 * <ul>
 *   <li><b>GET /api/v1/fuel</b> – All records (cached vehicle data).</li>
 *   <li><b>GET /api/v1/fuel/{id}</b> – Single record by ID.</li>
 *   <li><b>GET /api/v1/fuel/{id}/with-vehicle-data</b> – Single record with
 *       real-time vehicle data from the vehicle API.</li>
 *   <li><b>GET /api/v1/fuel/realtime/all</b> – All records with real-time data.
 *       <em>Warning: makes one API call per record; use only for small sets.</em></li>
 *   <li><b>GET /api/v1/fuel/vehicle/{vehicleId}</b> – Records for a vehicle (cached).</li>
 *   <li><b>GET /api/v1/fuel/vehicle/{vehicleId}/realtime</b> – Records for a vehicle
 *       with real-time data.</li>
 *   <li><b>GET /api/v1/fuel/driver/{driverId}</b> – Records for a driver.</li>
 *   <li><b>GET /api/v1/fuel/flagged</b> – All records flagged for misuse.</li>
 *   <li><b>GET /api/v1/fuel/search</b> – Filtered by date range and optional
 *       {@code vehicleId} / {@code driverId}.</li>
 * </ul>
 *
 * <h2>UPDATE Operations</h2>
 * <ul>
 *   <li><b>PUT  /api/v1/fuel/{id}</b> – Full update (all fields required).</li>
 *   <li><b>PATCH /api/v1/fuel/{id}</b> – Partial update (only changed fields needed).</li>
 * </ul>
 *
 * <h2>Flagging Operations</h2>
 * <ul>
 *   <li><b>PATCH /api/v1/fuel/{id}/flag</b>   – Manually mark a record as suspicious.</li>
 *   <li><b>PATCH /api/v1/fuel/{id}/unflag</b> – Clear the misuse flag from a record.</li>
 * </ul>
 *
 * <h2>DELETE Operations</h2>
 * <ul>
 *   <li><b>DELETE /api/v1/fuel/{id}</b> – Remove a fuel record permanently.</li>
 * </ul>
 *
 * <h2>Misuse Detection Rules</h2>
 * <p>Records are auto-flagged when any of the following conditions are met:</p>
 * <ol>
 *   <li>Quantity exceeds {@code fuel.misuse.max-litres-per-entry} (default: 100 L).</li>
 *   <li>Daily entry count for the same vehicle exceeds
 *       {@code fuel.misuse.max-entries-per-day} (default: 3).</li>
 *   <li>Odometer reading is lower than the previous recorded reading.</li>
 * </ol>
 *
 * <h2>Real-Time vs Cached Data</h2>
 * <ul>
 *   <li><b>Cached</b> (default) – reads the {@code vehicles} table; fast,
 *       best for lists and analytics.</li>
 *   <li><b>Real-Time</b> ({@code /realtime} endpoints) – makes an HTTP call to
 *       the vehicle service; guaranteed current, best for single-record detail views.
 *       Falls back to cached data gracefully if the vehicle API is unavailable.</li>
 * </ul>
 *
 * <h2>Error Response Format</h2>
 * <pre>
 * {
 *   "status":    404,
 *   "message":   "Fuel record not found",
 *   "timestamp": "2026-04-22T10:30:00"
 * }
 * </pre>
 *
 * @see com.vfms.fuel.controller.FuelController
 * @see com.vfms.fuel.service.FuelService
 * @see com.vfms.fuel.service.FuelMisuseService
 */
final class FuelApiDocumentation {

    /** Prevent instantiation – this is a documentation-only class. */
    private FuelApiDocumentation() {
    }
}
