package com.vfms.fuel.client;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.fuel.dto.VehicleDetailDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class VehicleApiClient {

    private final RestTemplate restTemplate;

    @Value("${app.vehicle.api.base-url:http://localhost:8080/api/vehicles}")
    private String vehicleApiBaseUrl;

    public VehicleDetailDto getVehicleById(Long vehicleId) {
        try {
            String url = vehicleApiBaseUrl + "/" + vehicleId;
            VehicleDetailDto vehicle = restTemplate.getForObject(url, VehicleDetailDto.class);
            if (vehicle == null) {
                throw new ResourceNotFoundException("Vehicle not found: " + vehicleId);
            }
            log.info("Successfully fetched vehicle: {}", vehicleId);
            return vehicle;
        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (RestClientException e) {
            log.error("Error fetching vehicle {}: {}", vehicleId, e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle details: " + vehicleId, e);
        }
    }

    public List<VehicleDetailDto> getAllVehicles(String status) {
        try {
            String url = vehicleApiBaseUrl;
            if (status != null && !status.isBlank()) {
                url += "?status=" + status;
            }

            VehicleDetailDto[] vehicles = restTemplate.getForObject(url, VehicleDetailDto[].class);
            return vehicles == null ? List.of() : List.of(vehicles);
        } catch (RestClientException e) {
            log.error("Error fetching all vehicles: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle list", e);
        }
    }

    public boolean vehicleExists(Long vehicleId) {
        try {
            String url = vehicleApiBaseUrl + "/" + vehicleId;
            restTemplate.getForObject(url, VehicleDetailDto.class);
            return true;
        } catch (RestClientException e) {
            log.debug("Vehicle {} not found or error occurred: {}", vehicleId, e.getMessage());
            return false;
        }
    }

    public VehicleDetailDto getVehicleByPlate(String plateNumber) {
        try {
            return getAllVehicles(null).stream()
                    .filter(vehicle -> vehicle.getPlateNumber().equalsIgnoreCase(plateNumber))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + plateNumber));
        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception e) {
            log.error("Error fetching vehicle by plate {}: {}", plateNumber, e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle by plate: " + plateNumber, e);
        }
    }
}
