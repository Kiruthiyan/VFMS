package com.vfms.config;

import com.vfms.auth.model.Role;
import com.vfms.auth.model.User;
import com.vfms.auth.repository.UserRepository;
import com.vfms.vehicle.model.Vehicle;
import com.vfms.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner commandLineRunner() {
        return args -> {
            try {
                System.out.println("\n======================================");
                System.out.println("🔄 Initializing database with test data...");
                System.out.println("======================================\n");

                // Create default admin user
                if (userRepository.findByEmail("kiruthiyan7@gmail.com").isEmpty()) {
                    var admin = User.builder()
                            .name("Kiruthiyan Admin")
                            .email("kiruthiyan7@gmail.com")
                            .password(passwordEncoder.encode("12345678"))
                            .phone("9876543210")
                            .role(Role.ADMIN)
                            .emailVerified(true)
                            .passwordChangeRequired(false)
                            .status("ACTIVE")
                            .joinedDate(java.time.LocalDate.now())
                            .build();
                    userRepository.save(admin);
                    System.out.println("✅ Admin User Created: kiruthiyan7@gmail.com / 12345678");
                }
                
                // Create test driver user
                if (userRepository.findByEmail("driver@example.com").isEmpty()) {
                    var driver = User.builder()
                            .name("Test Driver")
                            .email("driver@example.com")
                            .password(passwordEncoder.encode("12345678"))
                            .phone("9876543211")
                            .role(Role.DRIVER)
                            .emailVerified(true)
                            .passwordChangeRequired(false)
                            .status("ACTIVE")
                            .joinedDate(java.time.LocalDate.now())
                            .build();
                    userRepository.save(driver);
                    System.out.println("✅ Driver User Created: driver@example.com / 12345678");
                }
                
                // Create test approver user
                if (userRepository.findByEmail("approver@example.com").isEmpty()) {
                    var approver = User.builder()
                            .name("Test Approver")
                            .email("approver@example.com")
                            .password(passwordEncoder.encode("12345678"))
                            .phone("9876543212")
                            .role(Role.APPROVER)
                            .emailVerified(true)
                            .passwordChangeRequired(false)
                            .status("ACTIVE")
                            .joinedDate(java.time.LocalDate.now())
                            .build();
                    userRepository.save(approver);
                    System.out.println("✅ Approver User Created: approver@example.com / 12345678");
                }
                
                // Always refresh test vehicles for testing
                vehicleRepository.deleteAll();
                
                Vehicle vehicle1 = Vehicle.builder()
                        .make("Toyota")
                        .model("Fortuner")
                        .licensePlate("TN-2024-001")
                        .year(2024)
                        .type("SUV")
                        .status("AVAILABLE")
                        .fuelLevel("75%")
                        .currentOdometer(50000.0)
                        .lastServiceDate(java.time.LocalDate.now().minusMonths(1))
                        .build();
                vehicleRepository.save(vehicle1);
                System.out.println("✅ Vehicle 1: Toyota Fortuner (TN-2024-001) - 50000 km");
                
                Vehicle vehicle2 = Vehicle.builder()
                        .make("Hyundai")
                        .model("Creta")
                        .licensePlate("TN-2024-002")
                        .year(2023)
                        .type("SUV")
                        .status("AVAILABLE")
                        .fuelLevel("60%")
                        .currentOdometer(45000.0)
                        .lastServiceDate(java.time.LocalDate.now().minusMonths(2))
                        .build();
                vehicleRepository.save(vehicle2);
                System.out.println("✅ Vehicle 2: Hyundai Creta (TN-2024-002) - 45000 km");
                
                Vehicle vehicle3 = Vehicle.builder()
                        .make("Maruti")
                        .model("Swift")
                        .licensePlate("TN-2024-003")
                        .year(2022)
                        .type("Sedan")
                        .status("AVAILABLE")
                        .fuelLevel("80%")
                        .currentOdometer(62000.0)
                        .lastServiceDate(java.time.LocalDate.now().minusMonths(1))
                        .build();
                vehicleRepository.save(vehicle3);
                System.out.println("✅ Vehicle 3: Maruti Swift (TN-2024-003) - 62000 km");
                
                Vehicle vehicle4 = Vehicle.builder()
                        .make("Mahindra")
                        .model("XUV500")
                        .licensePlate("TN-2024-004")
                        .year(2023)
                        .type("SUV")
                        .status("AVAILABLE")
                        .fuelLevel("70%")
                        .currentOdometer(35000.0)
                        .lastServiceDate(java.time.LocalDate.now().minusMonths(3))
                        .build();
                vehicleRepository.save(vehicle4);
                System.out.println("✅ Vehicle 4: Mahindra XUV500 (TN-2024-004) - 35000 km");
                
                Vehicle vehicle5 = Vehicle.builder()
                        .make("Tata")
                        .model("Nexon")
                        .licensePlate("TN-2024-005")
                        .year(2022)
                        .type("Compact SUV")
                        .status("AVAILABLE")
                        .fuelLevel("85%")
                        .currentOdometer(28000.0)
                        .lastServiceDate(java.time.LocalDate.now().minusMonths(2))
                        .build();
                vehicleRepository.save(vehicle5);
                System.out.println("✅ Vehicle 5: Tata Nexon (TN-2024-005) - 28000 km");
                
                System.out.println("\n======================================");
                System.out.println("✅ DATABASE INITIALIZED SUCCESSFULLY!");
                System.out.println("✅ Total Users: 3 test accounts ready");
                System.out.println("✅ Total Vehicles: 5 vehicles ready");
                System.out.println("✅ System is ready for testing!");
                System.out.println("======================================\n");
                
            } catch (Exception e) {
                System.err.println("\n❌ =====================================");
                System.err.println("❌ Error during initialization: " + e.getMessage());
                System.err.println("❌ =====================================\n");
                e.printStackTrace();
            }
        };
    }
}
