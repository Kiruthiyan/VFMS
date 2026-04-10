package com.vfms.vehicle;

public enum VehicleStatus {
    AVAILABLE,
    RENTED,       // keep if frontend/API already uses this
    UNDER_MAINTENANCE,  // add this (required by MaintenanceService)
    RETIRED
}
