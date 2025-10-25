package com.example.fuel.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.fuel.entity.FuelRecord;

@Repository
public interface FuelRepository extends JpaRepository<FuelRecord, Long> {
    // save(), findAll(), deleteById() போன்ற method கள் இப்போ இருந்து வரும்
}
