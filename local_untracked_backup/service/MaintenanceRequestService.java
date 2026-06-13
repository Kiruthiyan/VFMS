package com.vfms.service;

import com.vfms.entity.MaintenanceRequest;
import com.vfms.repository.MaintenanceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceRequestService {

    @Autowired
    private MaintenanceRequestRepository repo;

    public List<MaintenanceRequest> getAllRequests() {
        return repo.findAll();
    }

    public Double getTotalCost() {
        Double cost = repo.getTotalMaintenanceCost();
        return cost != null ? cost : 0.0;
    }

    public Integer getTotalDowntime() {
        Integer downtime = repo.getTotalDowntime();
        return downtime != null ? downtime : 0;
    }
}
