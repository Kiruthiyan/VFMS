package com.vfms.config;

import com.vfms.entity.*;
import com.vfms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private VehicleRepository vehicleRepo;
    @Autowired
    private DriverRepository driverRepo;
    @Autowired
    private FuelLogRepository fuelRepo;
    @Autowired
    private MaintenanceLogRepository maintenanceRepo;
    @Autowired
    private RentalRepository rentalRepo;

    @Override
    public void run(String... args) throws Exception {
        if (vehicleRepo.count() == 0) {
            System.out.println("Initializing sample data for Supabase...");

            // 1. Vehicles
            Vehicle v1 = Vehicle.builder()
                    .name("Toyota Hilux").type("Pickup").licensePlate("KA-01-AB-1234")
                    .department("Logistics").totalDistance(12500.0).totalTrips(85).fuelConsumed(1200.0).build();
            Vehicle v2 = Vehicle.builder()
                    .name("Mercedes Sprinter").type("Van").licensePlate("KA-05-XY-9876")
                    .department("Staff Transport").totalDistance(8400.0).totalTrips(42).fuelConsumed(950.0).build();
            vehicleRepo.save(v1);
            vehicleRepo.save(v2);

            // 2. Drivers
            Driver d1 = Driver.builder()
                    .name("Kiruthiyan S.").department("Logistics").licenseNumber("DL-998877")
                    .licenseStatus("VALID").rating(4.9).totalTrips(120).totalDistance(15000.0).infractions(0)
                    .joiningDate(LocalDate.now().minusYears(2)).build();
            Driver d2 = Driver.builder()
                    .name("Arun Kumar").department("Support").licenseNumber("DL-554433")
                    .licenseStatus("VALID").rating(4.2).totalTrips(75).totalDistance(8000.0).infractions(1)
                    .joiningDate(LocalDate.now().minusMonths(6)).build();
            driverRepo.save(d1);
            driverRepo.save(d2);

            // 3. Fuel Logs
            FuelLog f1 = FuelLog.builder()
                    .licensePlate("KA-01-AB-1234").date(LocalDate.now().minusDays(2))
                    .fuelQuantity(60.0).pricePerLiter(102.50).totalCost(6150.0)
                    .fuelStation("Shell Metro").odometer(12450.0).vehicle(v1).build();
            FuelLog f2 = FuelLog.builder()
                    .licensePlate("KA-05-XY-9876").date(LocalDate.now().minusDays(5))
                    .fuelQuantity(45.0).pricePerLiter(101.20).totalCost(4554.0)
                    .fuelStation("Indian Oil").odometer(8350.0).vehicle(v2).build();
            fuelRepo.save(f1);
            fuelRepo.save(f2);

            // 4. Maintenance Logs
            MaintenanceLog ml1 = new MaintenanceLog();
            ml1.setVehicle(v1);
            ml1.setMaintenanceDate(LocalDate.now().minusWeeks(2));
            ml1.setCost(4850.0);
            ml1.setDescription("Engine Oil & Filter Change");
            ml1.setType("REPAIR");
            maintenanceRepo.save(ml1);

            // 5. Rentals
            RentalRecord rr1 = RentalRecord.builder()
                    .customerName("Corporate Hub").vehicle(v1).licensePlate(v1.getLicensePlate())
                    .startDate(LocalDate.now().minusWeeks(1))
                    .endDate(LocalDate.now().minusDays(2)).totalCost(12500.0).status("Completed").build();
            rentalRepo.save(rr1);

            System.out.println("Sample data successfully migrated to Supabase!");
        } else {
            System.out.println("Data already exists in Supabase. Skipping initialization.");
        }
    }
}
