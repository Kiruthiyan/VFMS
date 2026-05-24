CREATE TABLE vehicle_license_requirements (
    vehicle_category    VARCHAR(50) PRIMARY KEY,
    required_classes    TEXT[],
    required_cert_types TEXT[]
);

INSERT INTO vehicle_license_requirements VALUES
    ('LIGHT',     ARRAY['B'],    ARRAY[]::TEXT[]),
    ('MEDIUM',    ARRAY['C'],    ARRAY[]::TEXT[]),
    ('HEAVY',     ARRAY['CE'],   ARRAY['HEAVY_VEHICLE']),
    ('PASSENGER', ARRAY['D'],    ARRAY['PASSENGER_TRANSPORT']),
    ('TANKER',    ARRAY['CE'],   ARRAY['HAZMAT']);
