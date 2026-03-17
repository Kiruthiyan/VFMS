package com.vfms.config;

import com.vfms.fuel.model.FuelRecord;
import com.vfms.fuel.repository.FuelRepository;
import com.vfms.vehicle.model.Vehicle;
import com.vfms.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    private final VehicleRepository vehicleRepository;
    private final FuelRepository fuelRepository;

    @Override
    public void run(String... args) throws Exception {
        // Load sample vehicles only if database is empty
        if (vehicleRepository.count() > 0) {
            log.info("Sample vehicles already exist, skipping data load");
            return;
        }

        log.info("Loading sample vehicle data for fuel management module...");

        // Commercial Fleet Vehicles
        vehicleRepository.save(Vehicle.builder()
                .make("Tata")
                .model("Ace")
                .licensePlate("TN-01-AB-1234")
                .yearOfManufacture(2022)
                .fuelType("DIESEL")
                .vehicleType("COMMERCIAL")
                .currentOdometer(45230.5)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Ashok Leyland")
                .model("Dost")
                .licensePlate("TN-01-AB-1235")
                .yearOfManufacture(2021)
                .fuelType("DIESEL")
                .vehicleType("COMMERCIAL")
                .currentOdometer(52150.0)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Mahindra")
                .model("Bolero")
                .licensePlate("TN-01-AB-1236")
                .yearOfManufacture(2020)
                .fuelType("DIESEL")
                .vehicleType("COMMERCIAL")
                .currentOdometer(68420.3)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Force")
                .model("Trax")
                .licensePlate("TN-01-AB-1237")
                .yearOfManufacture(2023)
                .fuelType("DIESEL")
                .vehicleType("COMMERCIAL")
                .currentOdometer(39780.2)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Tata")
                .model("Nexon")
                .licensePlate("TN-01-AB-1238")
                .yearOfManufacture(2023)
                .fuelType("PETROL")
                .vehicleType("SUV")
                .currentOdometer(28540.8)
                .status("ACTIVE")
                .build());

        // Passenger Vehicles
        vehicleRepository.save(Vehicle.builder()
                .make("Hyundai")
                .model("i10")
                .licensePlate("TN-01-CD-5678")
                .yearOfManufacture(2022)
                .fuelType("PETROL")
                .vehicleType("SEDAN")
                .currentOdometer(34920.5)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Maruti")
                .model("Swift")
                .licensePlate("TN-01-CD-5679")
                .yearOfManufacture(2021)
                .fuelType("PETROL")
                .vehicleType("HATCHBACK")
                .currentOdometer(42310.0)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Honda")
                .model("City")
                .licensePlate("TN-01-CD-5680")
                .yearOfManufacture(2020)
                .fuelType("PETROL")
                .vehicleType("SEDAN")
                .currentOdometer(55670.2)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Tata")
                .model("Tiago")
                .licensePlate("TN-01-CD-5681")
                .yearOfManufacture(2023)
                .fuelType("PETROL")
                .vehicleType("HATCHBACK")
                .currentOdometer(18450.3)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Skoda")
                .model("Rapid")
                .licensePlate("TN-01-CD-5682")
                .yearOfManufacture(2019)
                .fuelType("DIESEL")
                .vehicleType("SEDAN")
                .currentOdometer(62340.1)
                .status("ACTIVE")
                .build());

        // Heavy Commercial Vehicles
        vehicleRepository.save(Vehicle.builder()
                .make("Volvo")
                .model("FH16")
                .licensePlate("TN-01-EF-9012")
                .yearOfManufacture(2018)
                .fuelType("DIESEL")
                .vehicleType("HEAVY_TRUCK")
                .currentOdometer(125680.5)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Scania")
                .model("G440")
                .licensePlate("TN-01-EF-9013")
                .yearOfManufacture(2017)
                .fuelType("DIESEL")
                .vehicleType("HEAVY_TRUCK")
                .currentOdometer(142350.2)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Howo")
                .model("371")
                .licensePlate("TN-01-EF-9014")
                .yearOfManufacture(2020)
                .fuelType("DIESEL")
                .vehicleType("HEAVY_TRUCK")
                .currentOdometer(98570.0)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Tata")
                .model("1618")
                .licensePlate("TN-01-EF-9015")
                .yearOfManufacture(2019)
                .fuelType("DIESEL")
                .vehicleType("HEAVY_TRUCK")
                .currentOdometer(105420.4)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Bharat Benz")
                .model("2523")
                .licensePlate("TN-01-EF-9016")
                .yearOfManufacture(2021)
                .fuelType("DIESEL")
                .vehicleType("HEAVY_TRUCK")
                .currentOdometer(87650.8)
                .status("ACTIVE")
                .build());

        // Special Purpose Vehicles
        vehicleRepository.save(Vehicle.builder()
                .make("Eicher")
                .model("Pro 6025")
                .licensePlate("TN-01-GH-3456")
                .yearOfManufacture(2019)
                .fuelType("DIESEL")
                .vehicleType("TRUCK")
                .currentOdometer(72340.5)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Bharat")
                .model("Dost")
                .licensePlate("TN-01-GH-3457")
                .yearOfManufacture(2022)
                .fuelType("DIESEL")
                .vehicleType("TRUCK")
                .currentOdometer(55230.2)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Piaggio")
                .model("Ape City")
                .licensePlate("TN-01-GH-3458")
                .yearOfManufacture(2023)
                .fuelType("CNG")
                .vehicleType("AUTO")
                .currentOdometer(28450.0)
                .status("ACTIVE")
                .build());

        vehicleRepository.save(Vehicle.builder()
                .make("Mahindra")
                .model("TUV300")
                .licensePlate("TN-01-GH-3459")
                .yearOfManufacture(2021)
                .fuelType("DIESEL")
                .vehicleType("SUV")
                .currentOdometer(41670.3)
                .status("ACTIVE")
                .build());

        log.info("✓ Sample vehicle data loaded successfully. Total vehicles: {}", vehicleRepository.count());

        seedFuelRecords();
    }

    private void seedFuelRecords() {
        if (fuelRepository.count() > 0) {
            log.info("Sample fuel records already exist, skipping fuel data load");
            return;
        }

        log.info("Loading sample fuel records...");

        // Fuel records spread over last 3 months for analytics
        LocalDate today = LocalDate.now();

        // TN-01-AB-1234 (Tata Ace - DIESEL)
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1234").driverId(1).quantity(45.5).cost(4641.0).pricePerLiter(102.0).mileage(45230.5).stationName("Shell Station").date(today.minusDays(2)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1234").driverId(1).quantity(50.0).cost(5100.0).pricePerLiter(102.0).mileage(44800.0).stationName("BP Fuel").date(today.minusDays(18)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1234").driverId(1).quantity(48.0).cost(4896.0).pricePerLiter(102.0).mileage(44300.0).stationName("Total Gas").date(today.minusDays(35)).build());

        // TN-01-AB-1235 (Ashok Leyland Dost - DIESEL)
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1235").driverId(1).quantity(55.0).cost(5610.0).pricePerLiter(102.0).mileage(52150.0).stationName("Shell Diesel").date(today.minusDays(5)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1235").driverId(1).quantity(60.0).cost(6120.0).pricePerLiter(102.0).mileage(51600.0).stationName("Total Diesel").date(today.minusDays(22)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1235").driverId(1).quantity(52.0).cost(5304.0).pricePerLiter(102.0).mileage(51000.0).stationName("Chevron Diesel").date(today.minusDays(40)).build());

        // TN-01-AB-1236 (Mahindra Bolero - DIESEL)
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1236").driverId(1).quantity(40.0).cost(4080.0).pricePerLiter(102.0).mileage(68420.3).stationName("BP Fuel").date(today.minusDays(3)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1236").driverId(1).quantity(42.0).cost(4284.0).pricePerLiter(102.0).mileage(68000.0).stationName("Shell Station").date(today.minusDays(20)).build());

        // TN-01-AB-1238 (Tata Nexon - PETROL)
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1238").driverId(1).quantity(35.0).cost(3710.0).pricePerLiter(106.0).mileage(28540.8).stationName("Chevron").date(today.minusDays(4)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1238").driverId(1).quantity(38.0).cost(4028.0).pricePerLiter(106.0).mileage(28200.0).stationName("Mobil").date(today.minusDays(19)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-AB-1238").driverId(1).quantity(40.0).cost(4240.0).pricePerLiter(106.0).mileage(27800.0).stationName("Exxon").date(today.minusDays(38)).build());

        // TN-01-CD-5678 (Hyundai i10 - PETROL)
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-CD-5678").driverId(1).quantity(30.0).cost(3180.0).pricePerLiter(106.0).mileage(34920.5).stationName("Shell Station").date(today.minusDays(6)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-CD-5678").driverId(1).quantity(32.0).cost(3392.0).pricePerLiter(106.0).mileage(34600.0).stationName("Gulf Oil").date(today.minusDays(25)).build());

        // TN-01-CD-5679 (Maruti Swift - PETROL)
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-CD-5679").driverId(1).quantity(28.0).cost(2968.0).pricePerLiter(106.0).mileage(42310.0).stationName("Texaco").date(today.minusDays(7)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-CD-5679").driverId(1).quantity(30.0).cost(3180.0).pricePerLiter(106.0).mileage(42000.0).stationName("Mobil").date(today.minusDays(28)).build());

        // TN-01-EF-9012 (Volvo FH16 - DIESEL)
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-EF-9012").driverId(1).quantity(150.0).cost(15300.0).pricePerLiter(102.0).mileage(125680.5).stationName("Shell Diesel").date(today.minusDays(1)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-EF-9012").driverId(1).quantity(160.0).cost(16320.0).pricePerLiter(102.0).mileage(125000.0).stationName("Total Diesel").date(today.minusDays(15)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-EF-9012").driverId(1).quantity(145.0).cost(14790.0).pricePerLiter(102.0).mileage(124200.0).stationName("Chevron Diesel").date(today.minusDays(32)).build());

        // TN-01-EF-9013 (Scania G440 - DIESEL)
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-EF-9013").driverId(1).quantity(140.0).cost(14280.0).pricePerLiter(102.0).mileage(142350.2).stationName("BP Fuel").date(today.minusDays(8)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-EF-9013").driverId(1).quantity(155.0).cost(15810.0).pricePerLiter(102.0).mileage(141600.0).stationName("Shell Diesel").date(today.minusDays(26)).build());

        // TN-01-GH-3458 (Piaggio Ape City - CNG)
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-GH-3458").driverId(1).quantity(20.0).cost(1400.0).pricePerLiter(70.0).mileage(28450.0).stationName("Other").date(today.minusDays(10)).build());
        fuelRepository.save(FuelRecord.builder().vehiclePlate("TN-01-GH-3458").driverId(1).quantity(22.0).cost(1540.0).pricePerLiter(70.0).mileage(28200.0).stationName("Other").date(today.minusDays(30)).build());

        log.info("✓ Sample fuel records loaded successfully. Total records: {}", fuelRepository.count());
    }
}
