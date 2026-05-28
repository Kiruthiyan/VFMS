package com.vfms.service;

import com.vfms.entity.RentalRecord;
import com.vfms.repository.RentalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RentalService {

    @Autowired
    private RentalRepository repo;

    public List<RentalRecord> getAllRentals() {
        return repo.findAll();
    }

    public Double getTotalRevenue() {
        Double revenue = repo.getTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }
}
