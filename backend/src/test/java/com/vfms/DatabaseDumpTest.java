package com.vfms;

import com.vfms.dsm.entity.DriverLeave;
import com.vfms.dsm.entity.DriverLicense;
import com.vfms.dsm.entity.DriverReadinessCache;
import com.vfms.dsm.repository.DriverLeaveRepository;
import com.vfms.dsm.repository.DriverLicenseRepository;
import com.vfms.dsm.repository.DriverReadinessCacheRepository;
import com.vfms.common.enums.Role;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

@SpringBootTest(classes = VfmsApplication.class)
public class DatabaseDumpTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverLicenseRepository licenseRepository;

    @Autowired
    private DriverLeaveRepository leaveRepository;

    @Autowired
    private DriverReadinessCacheRepository readinessCacheRepository;

    @Test
    public void dumpDriverReadinessInfo() {
        System.out.println("=== DRIVER READINESS DUMP ===");
        List<User> drivers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.DRIVER)
                .toList();
        System.out.println("Total drivers found: " + drivers.size());

        for (User driver : drivers) {
            System.out.println("\nDriver: " + driver.getFullName() + " (" + driver.getId() + ")");
            
            // Get cache
            DriverReadinessCache cache = readinessCacheRepository.findById(driver.getId()).orElse(null);
            if (cache != null) {
                System.out.println("Cache - License Valid: " + cache.getLicenseValid() + 
                                   ", On Leave Today: " + cache.getOnLeaveToday() + 
                                   ", Ready (isReady()): " + cache.isReady() + 
                                   ", Reason: " + cache.getNotReadyReason());
            } else {
                System.out.println("Cache: NOT FOUND");
            }

            // Get license info
            List<DriverLicense> licenses = licenseRepository.findByUser_IdOrderByCreatedAtDesc(driver.getId());
            System.out.println("Licenses (" + licenses.size() + "):");
            for (DriverLicense license : licenses) {
                System.out.println("  - Num: " + license.getLicenseNumber() + 
                                   ", Expiry: " + license.getExpiryDate() + 
                                   ", Status: " + license.getStatus() + 
                                   ", IsPrimary: " + license.getIsPrimary());
            }

            // Get leave info
            List<DriverLeave> leaves = leaveRepository.findByUserIdOrderByCreatedAtDesc(driver.getId());
            System.out.println("Leaves (" + leaves.size() + "):");
            for (DriverLeave leave : leaves) {
                System.out.println("  - Type: " + leave.getLeaveType() + 
                                   ", Start: " + leave.getStartDate() + 
                                   ", End: " + leave.getEndDate() + 
                                   ", Status: " + leave.getStatus());
            }
        }
        System.out.println("=== END OF DUMP ===");
    }
}
