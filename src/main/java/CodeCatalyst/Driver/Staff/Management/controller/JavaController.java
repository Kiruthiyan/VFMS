package CodeCatalyst.Driver.Staff.Management.controller;

import CodeCatalyst.Driver.Staff.Management.model.Driver;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin
class DriverController {

    private List<Driver> drivers = new ArrayList<>();

    public DriverController() {
        drivers.add(new Driver(1L, "John Smith", "LIC12345", "0711234567", true));
        drivers.add(new Driver(2L, "Alex Perera", "LIC98765", "0777654321", false));
    }

    @GetMapping
    public List<Driver> getAllDrivers() {
        return drivers;
    }

    @PostMapping
    public Driver addDriver(@RequestBody Driver driver) {
        drivers.add(driver);
        return driver;
    }

    @GetMapping("/{id}")
    public Driver getDriverById(@PathVariable Long id) {
        return drivers.stream()
                .filter(d -> d.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public String deleteDriver(@PathVariable Long id) {
        drivers.removeIf(driver -> driver.getId().equals(id));
        return "Driver deleted successfully!";
    }
}
