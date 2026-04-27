package com.vfms.service;

import com.vfms.entity.FuelLog;
import com.vfms.repository.FuelLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FuelLogService {

    @Autowired
    private FuelLogRepository repo;

    public List<FuelLog> getAllLogs() {
        return repo.findAll();
    }

    public Double getTotalSpend() {
        Double spend = repo.getTotalFuelSpend();
        return spend != null ? spend : 0.0;
    }

    public Double getTotalConsumption() {
        Double consumption = repo.getTotalFuelConsumption();
        return consumption != null ? consumption : 0.0;
    }
}
