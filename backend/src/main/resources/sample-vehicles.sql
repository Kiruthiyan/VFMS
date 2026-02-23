-- VFMS Sample Data - CORRECTED for actual schema
-- This matches the Vehicle entity schema

-- ===================================
-- 1. SAMPLE VEHICLES (Table: vehicle, not vehicles)
-- ===================================
INSERT INTO vehicle (make, model, license_plate, year, status, type, current_odometer, fuel_level, last_service_date) VALUES
('Toyota', 'Camry', 'ABC-1234', 2021, 'AVAILABLE', 'Sedan', 45000.0, '75%', '2024-01-15'),
('Honda', 'Accord', 'XYZ-5678', 2020, 'AVAILABLE', 'Sedan', 52000.0, '60%', '2024-01-20'),
('Ford', 'F-150', 'DEF-9012', 2022, 'AVAILABLE', 'Truck', 28000.0, '80%', '2024-02-01'),
('Chevrolet', 'Silverado', 'GHI-3456', 2021, 'AVAILABLE', 'Truck', 38000.0, '70%', '2024-01-25'),
('Nissan', 'Altima', 'JKL-7890', 2019, 'AVAILABLE', 'Sedan', 67000.0, '55%', '2024-01-10'),
('Tesla', 'Model 3', 'MNO-2345', 2023, 'AVAILABLE', 'Sedan', 12000.0, '90%', '2024-02-05'),
('BMW', 'X5', 'PQR-6789', 2020, 'MAINTENANCE', 'SUV', 55000.0, '40%', '2024-01-05'),
('Mercedes', 'Sprinter', 'STU-0123', 2021, 'AVAILABLE', 'Van', 41000.0, '65%', '2024-01-18');

-- Verify vehicles inserted
SELECT COUNT(*) as vehicle_count FROM vehicle;
