-- ========================================
-- MOCK FUEL RECORDS DATA
-- Quick Insert for Presentation
-- ========================================
-- Run this in pgAdmin after adding vehicles and creating users

-- STEP 1: First check your user IDs (to get driver_id)
-- Run this first: SELECT id, email, role FROM users;
-- Note the ID of your DRIVER user

-- STEP 2: Replace 'X' below with your actual DRIVER user ID
-- If you don't have a driver yet, you can use any user ID or NULL

-- Mock Fuel Records (Replace X with actual driver ID)
-- Using vehicle IDs 1-6 (assuming you have 6+ vehicles from the vehicle insert)

INSERT INTO fuel_logs (vehicle_id, driver_id, fuel_amount, total_cost, price_per_liter, mileage, station_name, purchase_date) VALUES
-- Toyota Camry (vehicle_id = 1)
(1, NULL, 45.5, 145.60, 3.20, 45320.0, 'Shell Station', '2024-02-17'),
(1, NULL, 42.0, 134.40, 3.20, 45000.0, 'BP Fuel', '2024-02-15'),
(1, NULL, 47.2, 151.04, 3.20, 44680.0, 'Total Gas', '2024-02-12'),
(1, NULL, 43.8, 140.16, 3.20, 44350.0, 'Chevron', '2024-02-08'),

-- Honda Accord (vehicle_id = 2)
(2, NULL, 50.0, 160.00, 3.20, 52380.0, 'Chevron', '2024-02-16'),
(2, NULL, 48.5, 155.20, 3.20, 52000.0, 'Shell Station', '2024-02-13'),
(2, NULL, 51.2, 163.84, 3.20, 51650.0, 'BP Fuel', '2024-02-09'),

-- Ford F-150 (vehicle_id = 3)
(3, NULL, 75.0, 210.00, 2.80, 28420.0, 'Shell Diesel', '2024-02-14'),
(3, NULL, 72.0, 201.60, 2.80, 28000.0, 'Total Diesel', '2024-02-10'),
(3, NULL, 78.5, 219.80, 2.80, 27580.0, 'Chevron Diesel', '2024-02-06'),

-- Chevrolet Silverado (vehicle_id = 4)
(4, NULL, 68.5, 191.80, 2.80, 38380.0, 'Chevron Diesel', '2024-02-15'),
(4, NULL, 70.2, 196.56, 2.80, 38000.0, 'BP Fuel', '2024-02-11'),

-- Nissan Altima (vehicle_id = 5)
(5, NULL, 44.0, 140.80, 3.20, 67340.0, 'BP Fuel', '2024-02-17'),
(5, NULL, 43.0, 137.60, 3.20, 67000.0, 'Shell Station', '2024-02-14'),
(5, NULL, 45.5, 145.60, 3.20, 66650.0, 'Total Gas', '2024-02-10'),

-- Tesla Model 3 (vehicle_id = 6) - Electric charging
(6, NULL, 0.0, 45.00, 0.15, 12100.0, 'Tesla Supercharger', '2024-02-16'),
(6, NULL, 0.0, 38.50, 0.15, 12000.0, 'Tesla Supercharger', '2024-02-12');

-- Verify fuel records were added
SELECT COUNT(*) as total_fuel_records FROM fuel_logs;

-- View recent fuel records
SELECT 
    fl.id,
    fl.vehicle_id,
    v.make || ' ' || v.model as vehicle,
    fl.fuel_amount as liters,
    fl.total_cost as cost,
    fl.station_name,
    fl.purchase_date as date
FROM fuel_logs fl
LEFT JOIN vehicle v ON fl.vehicle_id = v.id
ORDER BY fl.purchase_date DESC
LIMIT 20;
