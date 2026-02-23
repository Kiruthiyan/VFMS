-- VFMS Sample Data for Testing
-- Run this SQL script to populate the database with test data

-- ===================================
-- 1. SAMPLE VEHICLES
-- ===================================
INSERT INTO vehicles (make, model, license_plate, year, status, mileage, created_at, updated_at) VALUES
('Toyota', 'Camry', 'ABC-1234', 2021, 'ACTIVE', 45000, NOW(), NOW()),
('Honda', 'Accord', 'XYZ-5678', 2020, 'ACTIVE', 52000, NOW(), NOW()),
('Ford', 'F-150', 'DEF-9012', 2022, 'ACTIVE', 28000, NOW(), NOW()),
('Chevrolet', 'Silverado', 'GHI-3456', 2021, 'ACTIVE', 38000, NOW(), NOW()),
('Nissan', 'Altima', 'JKL-7890', 2019, 'ACTIVE', 67000, NOW(), NOW()),
('Tesla', 'Model 3', 'MNO-2345', 2023, 'ACTIVE', 12000, NOW(), NOW()),
('BMW', 'X5', 'PQR-6789', 2020, 'MAINTENANCE', 55000, NOW(), NOW()),
('Mercedes', 'Sprinter Van', 'STU-0123', 2021, 'ACTIVE', 41000, NOW(), NOW());

-- ===================================
-- 2. SAMPLE FUEL RECORDS
-- ===================================
-- Records for vehicle 1 (Toyota Camry ABC-1234)
INSERT INTO fuel_records (vehicle_id, date, quantity, cost, mileage, fuel_type, station_name, receipt_path, created_at) VALUES
(1, '2024-02-01', 45.5, 145.60, 45000, 'PETROL', 'Shell Station', null, NOW()),
(1, '2024-02-08', 42.3, 135.36, 45320, 'PETROL', 'Total Gas', null, NOW()),
(1, '2024-02-15', 48.2, 154.24, 45680, 'PETROL', 'BP Fuel', null, NOW()),
(1, '2024-02-22', 44.8, 143.36, 46020, 'PETROL', 'Shell Station', null, NOW()),

-- Records for vehicle 2 (Honda Accord XYZ-5678)
INSERT INTO fuel_records (vehicle_id, date, quantity, cost, mileage, fuel_type, station_name, receipt_path, created_at) VALUES
(2, '2024-02-02', 50.0, 160.00, 52000, 'PETROL', 'Chevron', null, NOW()),
(2, '2024-02-10', 47.5, 152.00, 52380, 'PETROL', 'Shell Station', null, NOW()),
(2, '2024-02-18', 51.2, 163.84, 52760, 'PETROL', 'Total Gas', null, NOW()),

-- Records for vehicle 3 (Ford F-150 DEF-9012)
INSERT INTO fuel_records (vehicle_id, date, quantity, cost, mileage, fuel_type, station_name, receipt_path, created_at) VALUES
(3, '2024-02-03', 75.0, 210.00, 28000, 'DIESEL', 'BP Fuel', null, NOW()),
(3, '2024-02-12', 72.5, 202.00, 28420, 'DIESEL', 'Shell Diesel', null, NOW()),
(3, '2024-02-20', 78.0, 218.40, 28850, 'DIESEL', 'Total Diesel', null, NOW()),

-- Records for vehicle 4 (Chevrolet Silverado GHI-3456)
INSERT INTO fuel_records (vehicle_id, date, quantity, cost, mileage, fuel_type, station_name, receipt_path, created_at) VALUES
(4, '2024-02-04', 68.5, 191.80, 38000, 'DIESEL', 'Chevron Diesel', null, NOW()),
(4, '2024-02-13', 70.2, 196.56, 38380, 'DIESEL', 'BP Fuel', null, NOW()),

-- Records for vehicle 5 (Nissan Altima JKL-7890)
INSERT INTO fuel_records (vehicle_id, date, quantity, cost, mileage, fuel_type, station_name, receipt_path, created_at) VALUES
(5, '2024-02-05', 43.0, 137.60, 67000, 'PETROL', 'Shell Station', null, NOW()),
(5, '2024-02-14', 41.5, 132.80, 67340, 'PETROL', 'Total Gas', null, NOW()),
(5, '2024-02-21', 44.8, 143.36, 67690, 'PETROL', 'BP Fuel', null, NOW()),

-- Add some unusual records for misuse detection testing
INSERT INTO fuel_records (vehicle_id, date, quantity, cost, mileage, fuel_type, station_name, receipt_path, created_at) VALUES
-- Excessive refueling (same day)
(1, '2024-02-25', 35.0, 112.00, 46250, 'PETROL', 'Quick Stop', null, NOW()),
(1, '2024-02-25', 40.0, 128.00, 46255, 'PETROL', 'Gas Mart', null, NOW()),
-- Unusual quantity (too high)
(2, '2024-02-24', 85.0, 272.00, 53000, 'PETROL', 'Mega Station', null, NOW()),
-- Suspicious mileage (decreasing)
(3, '2024-02-23', 55.0, 154.00, 28700, 'DIESEL', 'BP Fuel', null, NOW());

-- ===================================
-- 3. SAMPLE TRIPS (for drivers)
-- ===================================
-- Note: Replace user_id with actual driver IDs from your users table
-- These are placeholder values - update after creating users
INSERT INTO trips (vehicle_id, driver_id, destination, status, scheduled_time, start_time, end_time, start_mileage, end_mileage, notes, created_at) VALUES
(1, 1, 'Downtown Office', 'COMPLETED', '2024-02-15 08:00:00', '2024-02-15 08:05:00', '2024-02-15 09:30:00', 45680, 45720, 'Document delivery', NOW()),
(1, 1, 'Airport', 'COMPLETED', '2024-02-16 14:00:00', '2024-02-16 14:10:00', '2024-02-16 16:00:00', 45720, 45820, 'Client pickup', NOW()),
(2, 1, 'Warehouse District', 'IN_PROGRESS', '2024-02-17 10:00:00', '2024-02-17 10:05:00', null, 52760, null, 'Inventory check', NOW()),
(3, 1, 'Construction Site', 'PENDING', '2024-02-17 15:00:00', null, null, null, null, 'Equipment delivery', NOW()),
(4, 1, 'Port Authority', 'PENDING', '2024-02-18 07:00:00', null, null, null, null, 'Container inspection', NOW());

-- ===================================
-- 4. VERIFICATION NOTES
-- ===================================
-- After running this script, you should have:
-- ✅ 8 vehicles (7 active, 1 in maintenance)
-- ✅ 25+ fuel records across all vehicles
-- ✅ Some unusual records for testing misuse detection:
--    - Excessive refueling (vehicle 1, 2024-02-25)
--    - Unusual quantity (vehicle 2, 2024-02-24, 85L)
--    - Suspicious mileage (vehicle 3, decreasing odometer)
-- ✅ 5 trips with different statuses

-- ===================================
-- 5. USERS NOTE
-- ===================================
-- Users should be created through the application's signup endpoint:
-- POST /api/auth/signup
-- 
-- Create these test users:
-- 1. admin@vfms.com (role: ADMIN)
-- 2. staff@vfms.com (role: SYSTEM_USER)
-- 3. driver@vfms.com (role: DRIVER)
-- 4. approver@vfms.com (role: APPROVER)
--
-- Then update the driver_id in trips table to match the actual driver user ID

-- ===================================
-- QUICK STATS
-- ===================================
-- Total Fuel Records: 25+
-- Total Vehicles: 8
-- Total Trips: 5
-- Date Range: February 2024
-- Fuel Types: PETROL, DIESEL
-- Misuse Alerts Expected: 3-4
