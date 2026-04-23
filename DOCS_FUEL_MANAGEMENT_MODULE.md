# 📚 FUEL MANAGEMENT MODULE - COMPREHENSIVE DOCUMENTATION

## 🎯 Module Overview
The Fuel Management Module is responsible for managing fuel entries, fuel efficiency tracking, receipt storage, and fuel misuse detection. This module is **CURRENTLY PLANNED BUT NOT YET IMPLEMENTED** in the Java backend, though the frontend implementation exists in Next.js.

**Status:** ❌ Backend NOT Implemented | ✅ Frontend Partially Implemented

**Location:** `backend/src/main/java/com/vfms/fuel/` (To be created)

---

## 📁 Planned Module Structure

```
fuel/
├── controller/       # REST API endpoints [NOT IMPLEMENTED]
│   ├── FuelController.java              (User fuel entries)
│   ├── FuelHistoryController.java       (Fuel history & reports)
│   └── FuelMisuseController.java        (Misuse alerts)
│
├── service/         # Business logic [NOT IMPLEMENTED]
│   ├── FuelService.java                 (Core fuel operations)
│   ├── FuelMisuseDetectionService.java  (Anomaly detection)
│   ├── FuelEfficiencyService.java       (Efficiency calculation)
│   ├── ReceiptStorageService.java       (File management)
│   └── FuelReportService.java           (Reports & analytics)
│
├── entity/          # Database entities [NOT IMPLEMENTED]
│   ├── FuelRecord.java                  (Main fuel entry)
│   ├── FuelMisuseAlert.java             (Detected anomalies)
│   └── ReceiptFile.java                 (Receipt metadata)
│
├── repository/      # Database access [NOT IMPLEMENTED]
│   ├── FuelRecordRepository.java
│   ├── FuelMisuseAlertRepository.java
│   └── ReceiptFileRepository.java
│
├── dto/             # Data Transfer Objects [NOT IMPLEMENTED]
│   ├── CreateFuelEntryRequest.java
│   ├── UpdateFuelEntryRequest.java
│   ├── FuelEntryDto.java
│   ├── FuelHistoryDto.java
│   ├── FuelEfficiencyDto.java
│   ├── MisuseAlertDto.java
│   ├── FuelReportDto.java
│   └── ReceiptDto.java
│
└── util/            # Utilities [NOT IMPLEMENTED]
    ├── FuelMisuseDetector.java
    ├── EfficiencyCalculator.java
    └── ValidationUtil.java
```

---

## 📝 1. Fuel Record Entity (Planned)

**Purpose:** Store individual fuel entries logged by drivers

```java
@Entity
@Table(name = "fuel_records")
public class FuelRecord {
    
    // =============== PRIMARY KEY ===============
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    // =============== RELATIONSHIPS ===============
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;                  // Foreign Key to User (DRIVER role)
    
    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;              // FK to Vehicle (when vehicle module added)
    
    // =============== FUEL ENTRY DATA ===============
    @Column(nullable = false)
    private LocalDate fuelDate;           // Date fuel was purchased
    
    @Column(nullable = false)
    private BigDecimal quantityLiters;    // Amount of fuel (e.g., 45.5)
    
    @Column(nullable = false)
    private BigDecimal costPerLiter;      // Price per liter
    
    @Column(nullable = false)
    private BigDecimal totalCost;         // Total amount paid
    
    // =============== VEHICLE METRICS ===============
    @Column(nullable = false)
    private Long odometerReading;         // Odometer reading at fuel entry (in km)
    
    private Long previousOdometerReading; // Previous odometer for distance calc
    
    // =============== FUEL STATION & LOCATION ===============
    @Column(nullable = false)
    private String fuelStationName;       // e.g., "Shell Station - Highway 101"
    
    private String fuelStationLocation;   // Coordinates or address
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private FuelType fuelType;            // PETROL, DIESEL, CNG, ELECTRIC
    
    // =============== RECEIPT HANDLING ===============
    @OneToOne
    @JoinColumn(name = "receipt_file_id")
    private ReceiptFile receiptFile;      // Link to uploaded receipt
    
    private String receiptUrl;            // Supabase storage URL
    
    private LocalDateTime receiptUploadedAt;
    
    // =============== CALCULATED FIELDS ===============
    private BigDecimal fuelEfficiency;    // km/liter (calculated)
    
    private BigDecimal averageFuelCost;   // Average cost per km
    
    // =============== STATUS & VALIDATION ===============
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FuelEntryStatus status;       // PENDING, APPROVED, FLAGGED, REJECTED
    
    @Column(nullable = false)
    private boolean flaggedForReview;     // True if suspicious
    
    private String reviewNote;            // Admin notes on flagged entry
    
    // =============== TIMESTAMPS ===============
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // =============== METHODS ===============
    
    // Calculate fuel efficiency in km/liter
    public BigDecimal calculateEfficiency() {
        if (previousOdometerReading == null) return null;
        long distanceKm = odometerReading - previousOdometerReading;
        return BigDecimal.valueOf(distanceKm)
            .divide(quantityLiters, 2, RoundingMode.HALF_UP);
    }
    
    // Calculate cost per km
    public BigDecimal calculateCostPerKm() {
        if (previousOdometerReading == null) return null;
        long distanceKm = odometerReading - previousOdometerReading;
        return totalCost.divide(BigDecimal.valueOf(distanceKm), 2, RoundingMode.HALF_UP);
    }
}
```

---

## 📊 2. Fuel-Related Enums

### **FuelType Enum**
```java
public enum FuelType {
    PETROL,         // 95 Octane petrol
    DIESEL,         // Standard diesel
    CNG,            // Compressed natural gas
    ELECTRIC,       // Electric charging
    HYBRID,         // Hybrid fuel
    LPG             // Liquefied petroleum gas
}
```

---

### **FuelEntryStatus Enum**
```java
public enum FuelEntryStatus {
    PENDING,        // Awaiting admin approval
    APPROVED,       // Admin approved
    FLAGGED,        // Suspicious, needs review
    REJECTED,       // Rejected by admin
    ARCHIVED        // Old entry, no longer active
}
```

---

## 🚨 3. Fuel Misuse Detection

### **Misuse Alert Entity (Planned)**

```java
@Entity
@Table(name = "fuel_misuse_alerts")
public class FuelMisuseAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "fuel_record_id")
    private FuelRecord fuelRecord;
    
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;
    
    @Enumerated(EnumType.STRING)
    private AlertType alertType;
    
    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;      // LOW, MEDIUM, HIGH, CRITICAL
    
    private String description;
    
    private String recommendedAction;
    
    private LocalDateTime alertedAt;
    
    private boolean resolved;
}
```

---

### **Alert Types**

```java
public enum AlertType {
    
    // Quantity anomalies
    EXCESSIVE_QUANTITY,         // e.g., 200L in one go (tank overflow)
    INSUFFICIENT_QUANTITY,      // e.g., 2L (too little)
    ABNORMAL_QUANTITY_PATTERN,  // e.g., 10L, then 100L, then 5L
    
    // Efficiency anomalies
    LOW_FUEL_EFFICIENCY,        // km/L below expected
    HIGH_FUEL_CONSUMPTION,      // Consumption spike
    UNUSUAL_CONSUMPTION_PATTERN,// Random large changes
    
    // Cost anomalies
    EXCESSIVE_COST,             // Price per liter unusually high
    COST_JUMP,                  // Sudden price increase
    
    // Mileage anomalies
    NEGATIVE_MILEAGE,           // Odometer reading decreased
    IMPOSSIBLE_MILEAGE,         // e.g., 1000km in 1 day
    STALLED_MILEAGE,            // No progress, multiple entries same odometer
    
    // Temporal anomalies
    UNUSUAL_FREQUENCY,          // Too many refills in short time
    LARGE_TIME_GAP,             // Long time between refills
    
    // Location anomalies
    UNUSUAL_LOCATION,           // Fuel station not in normal route
    MULTIPLE_LOCATIONS_SAME_DAY,// Refilled in different locations same day
    
    // Behavior anomalies
    SUDDEN_BEHAVIOR_CHANGE,     // Driver pattern changed dramatically
    THEFT_INDICATION,           // Pattern suggests fuel theft
    
    // Administrative
    MISSING_RECEIPT,            // No receipt provided
    INVALID_RECEIPT,            // Receipt image invalid/unclear
    ENTRY_DISPUTE               // Driver disputes fuel calculation
}
```

---

### **Alert Severity Levels**

```
LOW         → Information only, no immediate action needed
            Examples: Minor cost increase, slight efficiency variance

MEDIUM      → Should be reviewed, may indicate issue
            Examples: Moderate quantity anomaly, notable efficiency drop

HIGH        → Significant issue, requires admin review
            Examples: Excessive quantity, low fuel efficiency pattern

CRITICAL    → Urgent, possible fraud/theft, immediate escalation
            Examples: Negative mileage, 500L in one entry, pattern of theft
```

---

## 🔍 4. Misuse Detection Rules (Planned Algorithm)

### **A. QUANTITY CHECKS**

```
Rule 1: EXCESSIVE_QUANTITY
├─ Tank capacity for vehicles typically 40-100L
├─ Alert if single entry > 150L
└─ Severity: CRITICAL

Rule 2: INSUFFICIENT_QUANTITY
├─ Minimum commercial entry usually 5L
├─ Alert if single entry < 3L
└─ Severity: MEDIUM

Rule 3: ABNORMAL_PATTERN
├─ Calculate rolling average of last 10 entries
├─ Alert if variance > 2 standard deviations
└─ Severity: HIGH
```

---

### **B. EFFICIENCY CHECKS**

```
Rule 4: LOW_FUEL_EFFICIENCY
├─ Baseline: Fleet average km/L (e.g., 8 km/L for trucks)
├─ Alert if efficiency < baseline * 0.7 (30% below normal)
├─ Consider: Driver, vehicle type, fuel type, road conditions
└─ Severity: MEDIUM

Rule 5: EFFICIENCY_DEGRADATION
├─ Monitor trend over time
├─ Alert if efficiency drops > 15% in one month
├─ Possible causes: Poor maintenance, driving behavior, theft
└─ Severity: MEDIUM-HIGH

Rule 6: SUDDEN_IMPROVEMENT
├─ Alert if efficiency jumps > 20% suddenly
├─ Possible causes: Entry errors, odometer tampering
└─ Severity: HIGH
```

---

### **C. MILEAGE CHECKS**

```
Rule 7: NEGATIVE_MILEAGE
├─ Current odometer < previous odometer
├─ Indicates odometer tampering
└─ Severity: CRITICAL

Rule 8: IMPOSSIBLE_MILEAGE
├─ Traveled distance > vehicle's max daily capability
├─ For trucks: max 800km/day on highway
├─ Alert if > 1000km in single day
└─ Severity: CRITICAL

Rule 9: STALLED_MILEAGE
├─ Same odometer reading in multiple entries over time
├─ Indicates vehicle not being used or odometer stopped
├─ Alert if same reading in 3+ entries in one month
└─ Severity: MEDIUM

Rule 10: UNREALISTIC_DISTANCE
├─ Very small distance between refills (< 50km) consistently
├─ May indicate short route + fuel inflation
└─ Severity: MEDIUM
```

---

### **D. COST CHECKS**

```
Rule 11: EXCESSIVE_FUEL_COST
├─ Monitor price per liter against regional averages
├─ Alert if cost > average * 1.3 (30% above normal)
├─ Cross-check with fuel station location
└─ Severity: MEDIUM

Rule 12: COST_VOLATILITY
├─ Alert if price per liter fluctuates wildly
├─ Market variations: 5-10% normal, > 20% suspicious
└─ Severity: MEDIUM-HIGH
```

---

### **E. TEMPORAL CHECKS**

```
Rule 13: UNUSUAL_FREQUENCY
├─ Alert if refilled more than once per day consistently
├─ Normal: 1 refill per 2-3 days
├─ High frequency may indicate fuel sharing/theft
└─ Severity: MEDIUM

Rule 14: LARGE_TIME_GAP
├─ Alert if gap between refills > 60 days
├─ May indicate vehicle inactive or fuel tank breach
└─ Severity: LOW-MEDIUM

Rule 15: FREQUENCY_ANOMALY
├─ Calculate normal refill interval for driver
├─ Alert if new interval differs by > 30%
└─ Severity: MEDIUM
```

---

### **F. PATTERN-BASED CHECKS**

```
Rule 16: SUDDEN_BEHAVIOR_CHANGE
├─ Establish baseline for driver over 3 months
├─ Alert if new behavior significantly differs
├─ Changes: quantity, frequency, efficiency, locations
└─ Severity: MEDIUM

Rule 17: CONSISTENT_LOW_EFFICIENCY
├─ Monitor over 5+ entries
├─ Persistent poor efficiency may indicate mechanical issues
├─ Or: Driver behavior patterns (idling, speeding)
└─ Severity: MEDIUM

Rule 18: ALTERNATING_PATTERNS
├─ Alert if quantity/cost alternates between high/low
├─ May indicate falsified entries
└─ Severity: HIGH
```

---

## 📊 5. Fuel Efficiency Calculations

### **Basic Efficiency Formula**

```
Fuel Efficiency (km/L) = Distance Traveled / Fuel Consumed

Example:
├─ Previous odometer: 50,000 km
├─ Current odometer: 50,400 km
├─ Fuel entered: 50 liters
└─ Efficiency = 400 / 50 = 8 km/L
```

---

### **Cost per Km Calculation**

```
Cost per Km = Total Fuel Cost / Distance Traveled

Example:
├─ Total cost: 2,000 (currency)
├─ Distance: 400 km
└─ Cost/km = 2,000 / 400 = 5 per km
```

---

### **Efficiency Benchmarks by Vehicle Type**

```
VEHICLE TYPE          NORMAL RANGE    WARNING THRESHOLD
─────────────────────────────────────────────────────────
Light Van (1-2L)      6-8 km/L        < 4.5 km/L
Standard Van (2-3L)   5-7 km/L        < 3.5 km/L
Truck (5-10L)         3-5 km/L        < 2 km/L
Heavy Truck (15L+)    2-3.5 km/L      < 1.5 km/L
Tanker               2-3 km/L        < 1 km/L
```

---

### **Efficiency Calculation Method**

```
// Simple Moving Average (SMA)
SMA_5 = Average of last 5 efficiency readings

// Trend Analysis
if (current_efficiency < SMA_5 * 0.85)  // 15% below average
    → LOW_EFFICIENCY alert

// Seasonal Adjustment
// Account for weather, seasons, traffic conditions
seasonal_factor = 0.95  // Winter might be -5% efficiency
adjusted_baseline = normal_efficiency * seasonal_factor
```

---

## 📝 6. Planned API Endpoints

### **A. FUEL ENTRY ENDPOINTS**

**Create Fuel Entry**
```
POST /api/fuel/entry
Content-Type: application/json

{
  "vehicleId": "uuid",
  "fuelDate": "2026-04-20",
  "quantityLiters": 45.5,
  "costPerLiter": 150,
  "odometerReading": 50400,
  "fuelStationName": "Shell Station - Highway 101",
  "fuelStationLocation": "12.97°N, 77.59°E",
  "fuelType": "DIESEL",
  "receiptFile": "(multipart file)"
}

Response:
{
  "success": true,
  "message": "Fuel entry created successfully",
  "data": {
    "id": "uuid",
    "driver": {...},
    "quantityLiters": 45.5,
    "costPerLiter": 150,
    "totalCost": 6825,
    "fuelEfficiency": null,  // Not calculated yet (no previous entry)
    "status": "PENDING",
    "flaggedForReview": false,
    "receiptUrl": "https://supabase.../receipts/...",
    "createdAt": "2026-04-20T10:30:00"
  }
}
```

---

**Get Fuel Entry**
```
GET /api/fuel/entry/{entryId}
Authentication: Required

Response:
{
  "success": true,
  "message": "Fuel entry retrieved",
  "data": {
    "id": "uuid",
    "driver": {...},
    "vehicle": {...},
    "fuelDate": "2026-04-20",
    "quantityLiters": 45.5,
    "costPerLiter": 150,
    "totalCost": 6825,
    "odometerReading": 50400,
    "previousOdometerReading": 50000,
    "distanceTraveled": 400,
    "fuelEfficiency": 8.79,
    "fuelType": "DIESEL",
    "fuelStationName": "Shell Station",
    "status": "APPROVED",
    "flaggedForReview": false,
    "receiptUrl": "...",
    "createdAt": "2026-04-20T10:30:00"
  }
}
```

---

**Update Fuel Entry**
```
PUT /api/fuel/entry/{entryId}
Authentication: Required (DRIVER or ADMIN)

{
  "quantityLiters": 46.0,
  "costPerLiter": 150,
  "odometerReading": 50405,
  "fuelStationName": "Shell Station Updated"
}

Response: Updated fuel entry object
```

---

**Delete Fuel Entry**
```
DELETE /api/fuel/entry/{entryId}
Authentication: Required (DRIVER own entry or ADMIN)

Response:
{
  "success": true,
  "message": "Fuel entry deleted successfully",
  "data": null
}
```

---

### **B. FUEL HISTORY ENDPOINTS**

**Get Driver's Fuel History**
```
GET /api/fuel/history
GET /api/fuel/history?driverId={uuid}
GET /api/fuel/history?vehicleId={uuid}
GET /api/fuel/history?startDate=2026-01-01&endDate=2026-04-30
GET /api/fuel/history?status=APPROVED&page=0&size=20

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "driver": "John Doe",
      "vehicle": "Vehicle Name",
      "fuelDate": "2026-04-20",
      "quantityLiters": 45.5,
      "costPerLiter": 150,
      "totalCost": 6825,
      "fuelEfficiency": 8.79,
      "status": "APPROVED",
      "flaggedForReview": false
    },
    ...
  ],
  "totalCount": 50,
  "pageNumber": 0,
  "totalPages": 3
}
```

---

**Get Fuel Statistics**
```
GET /api/fuel/stats?driverId={uuid}
GET /api/fuel/stats?vehicleId={uuid}
GET /api/fuel/stats?startDate=2026-01-01&endDate=2026-04-30

Response:
{
  "success": true,
  "data": {
    "totalEntries": 25,
    "totalQuantity": 1000.5,
    "totalCost": 150000,
    "averageEfficiency": 7.5,
    "averageCostPerLiter": 150,
    "averageCostPerKm": 5.2,
    "totalDistanceTraveled": 28500,
    "lowestEfficiency": 6.2,
    "highestEfficiency": 9.1,
    "efficiencyTrend": "DECLINING",  // IMPROVING, STABLE, DECLINING
    "flaggedEntries": 2
  }
}
```

---

### **C. MISUSE ALERT ENDPOINTS**

**Get Misuse Alerts**
```
GET /api/fuel/alerts
GET /api/fuel/alerts?severity=HIGH
GET /api/fuel/alerts?status=UNRESOLVED
GET /api/fuel/alerts?driverId={uuid}
GET /api/fuel/alerts?page=0&size=20

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fuelRecord": {...},
      "driver": "John Doe",
      "alertType": "LOW_FUEL_EFFICIENCY",
      "severity": "MEDIUM",
      "description": "Fuel efficiency is 40% below normal for driver",
      "recommendedAction": "Check vehicle maintenance, monitor driving behavior",
      "alertedAt": "2026-04-20T10:30:00",
      "resolved": false
    },
    ...
  ],
  "totalCount": 15,
  "unresolvedCount": 8
}
```

---

**Get Alert by ID**
```
GET /api/fuel/alerts/{alertId}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "fuelRecord": {...},
    "driver": "John Doe",
    "alertType": "EXCESSIVE_QUANTITY",
    "severity": "CRITICAL",
    "description": "Fuel quantity 150L exceeds tank capacity",
    "recommendedAction": "Investigate possible fuel theft or entry error",
    "alertedAt": "2026-04-20T10:30:00",
    "resolved": false,
    "resolutionNotes": null
  }
}
```

---

**Resolve Alert**
```
POST /api/fuel/alerts/{alertId}/resolve
Content-Type: application/json

{
  "resolutionNotes": "Verified with driver, tank has extended capacity",
  "resolved": true
}

Response:
{
  "success": true,
  "message": "Alert resolved successfully",
  "data": { /* updated alert */ }
}
```

---

### **D. RECEIPT ENDPOINTS**

**Upload Receipt**
```
POST /api/fuel/receipt/upload
Content-Type: multipart/form-data

Parameters:
├─ file: (receipt image file)
├─ fuelEntryId: (optional, link to fuel entry)
└─ description: (optional, user description)

Response:
{
  "success": true,
  "message": "Receipt uploaded successfully",
  "data": {
    "id": "uuid",
    "fileName": "receipt_20260420_104530.jpg",
    "fileUrl": "https://supabase.../receipts/...",
    "fileSize": 2048576,
    "uploadedAt": "2026-04-20T10:30:00",
    "status": "PENDING_VERIFICATION"
  }
}
```

---

**Verify Receipt (Admin)**
```
POST /api/fuel/receipt/{receiptId}/verify
Content-Type: application/json

{
  "verified": true,
  "ocrData": {
    "date": "2026-04-20",
    "amount": 6825,
    "fuelType": "DIESEL",
    "quantity": 45.5,
    "pricePerLiter": 150,
    "pumpNumber": "5",
    "stationName": "Shell Station - Highway 101"
  }
}

Response:
{
  "success": true,
  "message": "Receipt verified",
  "data": { /* receipt data */ }
}
```

---

## 🛢️ 7. Receipt File Entity (Planned)

```java
@Entity
@Table(name = "receipt_files")
public class ReceiptFile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "fuel_entry_id")
    private FuelRecord fuelRecord;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String fileUrl;               // Supabase storage URL
    
    @Column(nullable = false)
    private Long fileSize;                // In bytes
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private FileType fileType;            // JPEG, PNG, PDF
    
    @Enumerated(EnumType.STRING)
    private ReceiptStatus status;         // PENDING, VERIFIED, INVALID, REJECTED
    
    private String ocrExtractedData;      // JSON string of OCR data
    
    private String verificationNotes;
    
    @CreationTimestamp
    private LocalDateTime uploadedAt;
    
    @UpdateTimestamp
    private LocalDateTime verifiedAt;
}
```

---

## 🎯 8. Planned Service Methods

### **FuelService**

```java
public interface FuelService {
    
    // CRUD operations
    FuelRecordDto createFuelEntry(CreateFuelEntryRequest request, User driver);
    FuelRecordDto getFuelEntryById(UUID entryId);
    FuelRecordDto updateFuelEntry(UUID entryId, UpdateFuelEntryRequest request);
    void deleteFuelEntry(UUID entryId);
    
    // List operations
    Page<FuelRecordDto> getFuelHistory(UUID driverId, Pageable pageable);
    Page<FuelRecordDto> getFuelHistoryByVehicle(UUID vehicleId, Pageable pageable);
    Page<FuelRecordDto> getFuelHistoryByDateRange(
        LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // Statistics
    FuelStatisticsDto calculateStatistics(UUID driverId);
    FuelStatisticsDto calculateStatisticsForVehicle(UUID vehicleId);
    FuelStatisticsDto calculateStatisticsForDateRange(
        UUID driverId, LocalDate start, LocalDate end);
}
```

---

### **FuelMisuseDetectionService**

```java
public interface FuelMisuseDetectionService {
    
    // Detection
    List<FuelMisuseAlert> detectAnomalies(FuelRecord newEntry);
    FuelMisuseAlert createAlert(FuelRecord entry, AlertType type, AlertSeverity severity);
    
    // Retrieval
    Page<FuelMisuseAlert> getUnresolvedAlerts(Pageable pageable);
    Page<FuelMisuseAlert> getAlertsBySeverity(AlertSeverity severity, Pageable pageable);
    Page<FuelMisuseAlert> getAlertsForDriver(UUID driverId, Pageable pageable);
    
    // Resolution
    void resolveAlert(UUID alertId, String resolutionNotes);
    void resolveAlertsForEntry(UUID fuelRecordId);
}
```

---

### **FuelEfficiencyService**

```java
public interface FuelEfficiencyService {
    
    // Calculate efficiency
    BigDecimal calculateEfficiency(FuelRecord record);
    BigDecimal calculateEfficiency(long distanceKm, BigDecimal fuelQuantity);
    
    // Trend analysis
    FuelEfficiencyTrend analyzeEfficiencyTrend(UUID driverId, int numEntries);
    BigDecimal getAverageEfficiency(UUID driverId, int numEntries);
    BigDecimal getBaselineEfficiency(UUID vehicleId);
    
    // Comparison
    boolean isEfficiencyAbnormal(FuelRecord record);
    BigDecimal getEfficiencyVariance(FuelRecord record);
}
```

---

## 🔐 9. Security & Permissions

### **Role-Based Access**

```
DRIVER
├─ Create own fuel entries
├─ View own fuel history
├─ Upload own receipts
└─ Cannot view other drivers' data

APPROVER
├─ View assigned drivers' fuel data
├─ Approve flagged entries
├─ Generate reports for assigned drivers
└─ Cannot approve own entries

ADMIN
├─ View all fuel data
├─ Approve/reject all entries
├─ Resolve all alerts
├─ Access all receipts
├─ Generate system-wide reports
└─ Full administrative access

SYSTEM_USER
└─ View-only access to fuel data
```

---

### **Entry Validation Rules**

```
Before Creating Entry:
├─ Driver must be APPROVED status
├─ Vehicle must be active
├─ Fuel quantity must be > 0
├─ Cost must be reasonable (not > 10x average regional price)
├─ Odometer must be >= previous odometer
├─ Date must not be in future
└─ Receipt file must be valid image/PDF

During Entry Processing:
├─ Run misuse detection algorithm
├─ If flagged: status = FLAGGED, requires admin review
├─ If clean: status = PENDING, auto-approve after verification
└─ Calculate efficiency, cost metrics
```

---

## 📊 10. Database Schema

```sql
-- Main fuel records table
CREATE TABLE fuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID NOT NULL,  -- FK to vehicles table (not yet implemented)
    
    -- Entry data
    fuel_date DATE NOT NULL,
    quantity_liters NUMERIC(10,2) NOT NULL,
    cost_per_liter NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(15,2) NOT NULL,
    
    -- Vehicle metrics
    odometer_reading BIGINT NOT NULL,
    previous_odometer_reading BIGINT,
    distance_traveled BIGINT GENERATED ALWAYS AS (
        odometer_reading - COALESCE(previous_odometer_reading, 0)
    ) STORED,
    
    -- Station info
    fuel_station_name VARCHAR(255) NOT NULL,
    fuel_station_location VARCHAR(255),
    fuel_type VARCHAR(50) NOT NULL,
    
    -- Receipt
    receipt_file_id UUID REFERENCES receipt_files(id),
    receipt_url TEXT,
    receipt_uploaded_at TIMESTAMP,
    
    -- Calculated fields
    fuel_efficiency NUMERIC(10,3),
    average_fuel_cost NUMERIC(10,2),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    flagged_for_review BOOLEAN DEFAULT false,
    review_note TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Misuse alerts
CREATE TABLE fuel_misuse_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fuel_record_id UUID REFERENCES fuel_records(id),
    driver_id UUID REFERENCES users(id),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT,
    alerted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT
);

-- Receipt files
CREATE TABLE receipt_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fuel_entry_id UUID REFERENCES fuel_records(id),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    ocr_extracted_data JSONB,
    verification_notes TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_fuel_driver ON fuel_records(driver_id);
CREATE INDEX idx_fuel_vehicle ON fuel_records(vehicle_id);
CREATE INDEX idx_fuel_status ON fuel_records(status);
CREATE INDEX idx_fuel_date ON fuel_records(fuel_date);
CREATE INDEX idx_alerts_driver ON fuel_misuse_alerts(driver_id);
CREATE INDEX idx_alerts_severity ON fuel_misuse_alerts(severity);
CREATE INDEX idx_alerts_resolved ON fuel_misuse_alerts(resolved);
```

---

## 🚀 11. Implementation Roadmap

### **Phase 1: Core Fuel Management (Priority: HIGH)**
- [ ] FuelRecord entity creation
- [ ] FuelRecordRepository implementation
- [ ] Basic CRUD operations
- [ ] Receipt file upload integration
- [ ] Fuel entry creation/update endpoints
- [ ] Fuel history retrieval endpoints

### **Phase 2: Misuse Detection (Priority: HIGH)**
- [ ] FuelMisuseAlert entity
- [ ] Detection algorithm implementation
- [ ] Alert creation and tracking
- [ ] Alert resolution workflow
- [ ] Admin alert management endpoints

### **Phase 3: Efficiency Calculation (Priority: MEDIUM)**
- [ ] Efficiency calculation logic
- [ ] Trend analysis
- [ ] Baseline establishment
- [ ] Efficiency-based alerts

### **Phase 4: Reporting & Analytics (Priority: MEDIUM)**
- [ ] Fuel statistics calculation
- [ ] Report generation
- [ ] Charts and graphs data
- [ ] Export functionality
- [ ] Driver performance reports

### **Phase 5: Advanced Features (Priority: LOW)**
- [ ] OCR for receipt parsing
- [ ] AI-based anomaly detection
- [ ] Predictive maintenance alerts
- [ ] Cost optimization recommendations
- [ ] Integration with fuel price APIs

---

## 📌 12. Integration Points

**With User Module:**
- Link fuel entries to drivers (User DRIVER role)
- User status validation before entry creation
- Driver permission checks

**With Vehicle Module (When Created):**
- Link fuel entries to vehicles
- Vehicle fuel tank capacity validation
- Vehicle maintenance history integration

**With Auth Module:**
- JWT authentication for endpoints
- Role-based access control
- Driver identity verification

**With Supabase Storage:**
- Receipt file upload/download
- File persistence
- URL generation

**With Admin Module (When Created):**
- Alert management dashboard
- Approval workflows
- Report generation

---

## ⚠️ 13. Current Status & Gaps

**Frontend Status:**
- ✅ Driver fuel entry form
- ✅ Fuel history view
- ✅ Receipt upload
- ✅ Fuel efficiency display
- ✅ Admin alerts dashboard

**Backend Status:**
- ❌ Not implemented
- ❌ No endpoints
- ❌ No services
- ❌ No repositories
- ❌ No misuse detection
- ❌ No database tables

---

## 🔗 14. Dependencies & Prerequisites

Before implementing, ensure:
1. ✅ User management module complete
2. ✅ Auth module with JWT working
3. ✅ Supabase configured for file storage
4. ✅ Email service (already done)
5. ⏳ Vehicle module (optional but recommended)
6. ⏳ Admin approval workflow (recommended)

---

## 📋 15. Testing Considerations

**Unit Tests:**
- Efficiency calculations
- Misuse detection rules
- Date/time validations
- Status transitions

**Integration Tests:**
- Create fuel entry → detect anomalies
- Upload receipt → link to entry
- Get fuel history with filters
- Calculate statistics

**Functional Tests:**
- Complete fuel entry workflow
- Admin alert resolution
- Permission checks
- Data consistency

---

## 💡 16. Performance Optimization

```
Caching Strategy:
├─ Cache efficiency baselines per vehicle
├─ Cache recent fuel entries (last 30 days)
├─ Cache driver statistics (updated daily)
└─ Invalidate on new entry creation

Database Indexing:
├─ driver_id, vehicle_id (frequent lookups)
├─ fuel_date (range queries)
├─ status (filtering)
└─ created_at (sorting)

Query Optimization:
├─ Use pagination for large datasets
├─ Lazy-load related entities
├─ Batch calculate statistics
└─ Use native queries for complex analytics
```

---

## 📌 Key Takeaways

1. **Not Yet Implemented** - Design complete, backend not started
2. **Complex Detection** - Misuse detection requires sophisticated algorithms
3. **Data-Driven** - Efficiency metrics drive operational insights
4. **Security-First** - Role-based access essential
5. **Audit Trail** - All entries flagged/approved for compliance
6. **Receipt Validation** - Critical for fraud prevention
7. **Real-Time Alerts** - Immediate notification of anomalies
8. **Historical Tracking** - Complete audit log of all fuel entries

---

*Last Updated: April 2026*
*Version: 1.0*
*Status: Design Complete | Backend Implementation Pending*
