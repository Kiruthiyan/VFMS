package com.vfms.fuel.client;

import com.vfms.fuel.dto.VehicleDetailDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

/**
 * REST Client for fetching vehicle details from Vehicle endpoints
 * Provides real-time vehicle data for fuel management module
 * Uses RestTemplate for HTTP communication with Supabase-backed vehicle API
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VehicleApiClient {

    private final RestTemplate restTemplate;

    @Value("${app.vehicle.api.base-url:http://localhost:8080/api/vehicles}")
    private String vehicleApiBaseUrl;

    /**
     * Fetch a single vehicle by ID with real-time data from Supabase
     * 
     * @param vehicleId UUID of the vehicle
     * @return VehicleDetailDto with current data from database
     */
    public VehicleDetailDto getVehicleById(UUID vehicleId) {
        try {
            String url = vehicleApiBaseUrl + "/" + vehicleId;
            log.debug("Fetching vehicle from: {}", url);
            
            VehicleDetailDto vehicle = restTemplate.getForObject(url, VehicleDetailDto.class);
            log.info("Successfully fetched vehicle: {} - {}", vehicleId, vehicle.getDisplayName());
            
            return vehicle;
        } catch (RestClientException e) {
            log.error("Error fetching vehicle {}: {}", vehicleId, e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle details: " + vehicleId, e);
        }
    }

    /**
     * Fetch all vehicles with optional status filter
     * 
     * @param status Optional vehicle status filter (e.g., "AVAILABLE", "IN_USE")
     * @return List of VehicleDetailDto
     */
    public List<VehicleDetailDto> getAllVehicles(String status) {
        try {
            String url = vehicleApiBaseUrl;
            if (status != null && !status.isEmpty()) {
                url += "?status=" + status;
            }
            
            log.debug("Fetching all vehicles from: {}", url);
            VehicleDetailDto[] vehicles = restTemplate.getForObject(url, VehicleDetailDto[].class);
            
            if (vehicles != null) {
                log.info("Successfully fetched {} vehicles", vehicles.length);
                return List.of(vehicles);
            }
            return List.of();
        } catch (RestClientException e) {
            log.error("Error fetching all vehicles: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle list", e);
        }
    }

    /**
     * Verify vehicle exists before creating fuel record
     * 
     * @param vehicleId UUID to check
     * @return true if vehicle exists, false otherwise
     */
    public boolean vehicleExists(UUID vehicleId) {
        try {
            String url = vehicleApiBaseUrl + "/" + vehicleId;
            restTemplate.getForObject(url, VehicleDetailDto.class);
            return true;
        } catch (RestClientException e) {
            log.debug("Vehicle {} not found or error occurred: {}", vehicleId, e.getMessage());
            return false;
        }
    }

    /**
     * Get vehicle by plate number
     * Note: This requires filtering on the API side
     * 
     * @param plateNumber Vehicle plate number
     * @return VehicleDetailDto if found
     */
    public VehicleDetailDto getVehicleByPlate(String plateNumber) {
        try {
            List<VehicleDetailDto> allVehicles = getAllVehicles(null);
            return allVehicles.stream()
                    .filter(v -> v.getPlateNumber().equalsIgnoreCase(plateNumber))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Vehicle not found: " + plateNumber));
        } catch (Exception e) {
            log.error("Error fetching vehicle by plate {}: {}", plateNumber, e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle by plate: " + plateNumber, e);
        }
    }
}
