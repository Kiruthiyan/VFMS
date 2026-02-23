-- ========================================
-- VFMS COMPLETE SAMPLE DATA FOR PRESENTATION
-- Run this in pgAdmin Query Tool
-- ========================================

-- 1. ADD SAMPLE VEHICLES (8 vehicles)
-- ========================================
-- Note: This uses the correct schema matching Vehicle.java entity
INSERT INTO vehicle (make, model, license_plate, year, status, type, current_odometer, fuel_level) VALUES
('Toyota', 'Camry', 'ABC-1234', 2021, 'AVAILABLE', 'Sedan', 45000.0, '75%'),
('Honda', 'Accord', 'XYZ-5678', 2020, 'AVAILABLE', 'Sedan', 52000.0, '60%'),
('Ford', 'F-150', 'DEF-9012', 2022, 'AVAILABLE', 'Truck', 28000.0, '80%'),
('Chevrolet', 'Silverado', 'GHI-3456', 2021, 'AVAILABLE', 'Truck', 38000.0, '70%'),
('Nissan', 'Altima', 'JKL-7890', 2019, 'AVAILABLE', 'Sedan', 67000.0, '55%'),
('Tesla', 'Model 3', 'MNO-2345', 2023, 'AVAILABLE', 'Sedan', 12000.0, '90%'),
('BMW', 'X5', 'PQR-6789', 2020, 'MAINTENANCE', 'SUV', 55000.0, '40%'),
('Mercedes', 'Sprinter', 'STU-0123', 2021, 'AVAILABLE', 'Van', 41000.0, '65%');

-- Verify vehicles added
SELECT COUNT(*) as total_vehicles FROM vehicle;

-- ========================================
-- USERS MUST BE CREATED VIA APPLICATION
-- ========================================
-- Use the application signup page to create these test users:
-- 
-- 1. Admin User:
--    Email: admin@vfms.com
--    Password: Admin@123
--    Role: ADMIN
--
-- 2. Staff User:
--    Email: staff@vfms.com
--    Password: Staff@123
--    Role: SYSTEM_USER or STAFF
--
-- 3. Driver User:
--    Email: driver@vfms.com
--    Password: Driver@123
--    Role: DRIVER
--
-- 4. Approver User:
--    Email: approver@vfms.com
--    Password: Approver@123
--    Role: APPROVER
--
-- After creating users, note their IDs for the next steps

-- ========================================
-- 2. ADD FUEL RECORDS (After creating users)
-- ========================================
-- Replace the driver_id values with actual user IDs from your users table
-- Example: If driver user has id=3, replace 1 with 3 below

-- First, let's check user IDs:
-- SELECT id, email, role FROM users;

-- Sample fuel records for different vehicles
-- Note: You'll need to update driver_id after creating users
INSERT INTO fuel_record (vehicle_id, driver_id, date, quantity, cost, current_odometer, station_name, fuel_type) VALUES
-- Vehicle 1 (Toyota Camry) - driver_id should be the actual driver's ID
(1, 1, '2024-02-15', 45.5, 145.60, 45320.0, 'Shell Station', 'PETROL'),
(1, 1, '2024-02-10', 42.0, 134.40, 45000.0, 'BP Fuel', 'PETROL'),
(1, 1, '2024-02-05', 47.2, 151.04, 44680.0, 'Total Gas', 'PETROL'),

-- Vehicle 2 (Honda Accord)
(2, 1, '2024-02-16', 50.0, 160.00, 52380.0, 'Chevron', 'PETROL'),
(2, 1, '2024-02-11', 48.5, 155.20, 52000.0, 'Shell Station', 'PETROL'),

-- Vehicle 3 (Ford F-150)
(3, 1, '2024-02-14', 75.0, 210.00, 28420.0, 'Shell Diesel', 'DIESEL'),
(3, 1, '2024-02-08', 72.0, 201.60, 28000.0, 'Total Diesel', 'DIESEL'),

-- Vehicle 4 (Chevrolet Silverado)
(4, 1, '2024-02-13', 68.5, 191.80, 38380.0, 'Chevron Diesel', 'DIESEL'),

-- Vehicle 5 (Nissan Altima)
(5, 1, '2024-02-17', 44.0, 140.80, 67340.0, 'BP Fuel', 'PETROL'),
(5, 1, '2024-02-12', 43.0, 137.60, 67000.0, 'Shell Station', 'PETROL');

-- Verify fuel records added
SELECT COUNT(*) as total_fuel_records FROM fuel_record;

-- ========================================
-- FINAL VERIFICATION
-- ========================================
SELECT 
    (SELECT COUNT(*) FROM vehicle) as total_vehicles,
    (SELECT COUNT(*) FROM fuel_record) as total_fuel_records,
    (SELECT COUNT(*) FROM users) as total_users;

-- View all vehicles
SELECT id, make, model, license_plate, status, type FROM vehicle ORDER BY id;

-- View recent fuel records (after users are created)
SELECT 
    fr.id,
    v.make || ' ' || v.model as vehicle,
    v.license_plate,
    fr.quantity as liters,
    fr.cost,
    fr.station_name,
    fr.date
FROM fuel_record fr
JOIN vehicle v ON fr.vehicle_id = v.id
ORDER BY fr.date DESC
LIMIT 10;
