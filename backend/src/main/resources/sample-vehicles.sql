-- VFMS Sample Vehicle Data for Fuel Management Module
-- Sample vehicles with license plates for tracking fuel consumption

-- ===================================
-- SAMPLE VEHICLES (For Fuel Management Module)
-- ===================================
INSERT INTO _vehicle (make, model, license_plate, manufacture_year, fuel_type, vehicle_type, current_odometer, status, created_at, updated_at) 
VALUES 
    -- COMMERCIAL FLEET VEHICLES (Tata, Ashok Leyland, etc.)
    ('Tata', 'Ace', 'TN-01-AB-1234', 2022, 'DIESEL', 'COMMERCIAL', 45230.5, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Ashok Leyland', 'Dost', 'TN-01-AB-1235', 2021, 'DIESEL', 'COMMERCIAL', 52150.0, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Mahindra', 'Bolero', 'TN-01-AB-1236', 2020, 'DIESEL', 'COMMERCIAL', 68420.3, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Force', 'Trax', 'TN-01-AB-1237', 2023, 'DIESEL', 'COMMERCIAL', 39780.2, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Tata', 'Nexon', 'TN-01-AB-1238', 2023, 'PETROL', 'SUV', 28540.8, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    
    -- PASSENGER VEHICLES (Hyundai, Maruti, Honda)
    ('Hyundai', 'i10', 'TN-01-CD-5678', 2022, 'PETROL', 'SEDAN', 34920.5, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Maruti', 'Swift', 'TN-01-CD-5679', 2021, 'PETROL', 'HATCHBACK', 42310.0, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Honda', 'City', 'TN-01-CD-5680', 2020, 'PETROL', 'SEDAN', 55670.2, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Tata', 'Tiago', 'TN-01-CD-5681', 2023, 'PETROL', 'HATCHBACK', 18450.3, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Skoda', 'Rapid', 'TN-01-CD-5682', 2019, 'DIESEL', 'SEDAN', 62340.1, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    
    -- HEAVY COMMERCIAL VEHICLES (Volvo, Scania, Bharat Benz)
    ('Volvo', 'FH16', 'TN-01-EF-9012', 2018, 'DIESEL', 'HEAVY_TRUCK', 125680.5, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Scania', 'G440', 'TN-01-EF-9013', 2017, 'DIESEL', 'HEAVY_TRUCK', 142350.2, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Howo', '371', 'TN-01-EF-9014', 2020, 'DIESEL', 'HEAVY_TRUCK', 98570.0, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Tata', '1618', 'TN-01-EF-9015', 2019, 'DIESEL', 'HEAVY_TRUCK', 105420.4, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Bharat Benz', '2523', 'TN-01-EF-9016', 2021, 'DIESEL', 'HEAVY_TRUCK', 87650.8, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    
    -- SPECIAL PURPOSE VEHICLES (Eicher, Piaggio, Mahindra)
    ('Eicher', 'Pro 6025', 'TN-01-GH-3456', 2019, 'DIESEL', 'TRUCK', 72340.5, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Bharat', 'Dost', 'TN-01-GH-3457', 2022, 'DIESEL', 'TRUCK', 55230.2, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Piaggio', 'Ape City', 'TN-01-GH-3458', 2023, 'CNG', 'AUTO', 28450.0, 'ACTIVE', CURRENT_DATE, CURRENT_DATE),
    ('Mahindra', 'TUV300', 'TN-01-GH-3459', 2021, 'DIESEL', 'SUV', 41670.3, 'ACTIVE', CURRENT_DATE, CURRENT_DATE);

-- Note: License plates are required for fuel management module
-- All vehicles inserted with ACTIVE status
-- Dates set to current date; can be updated as per actual registration dates

