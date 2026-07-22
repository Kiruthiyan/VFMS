# Complete Dashboard & Report Pages Inventory
**Generated: 2026-07-01**

## ADMIN DASHBOARDS

### 1. Admin Main Dashboard
**Location:** `/frontend/src/app/dashboards/admin/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | PageHeader component with icon (Users), title, description, Refresh & Quick Action buttons |
| **KPIs** | • Total Users<br>• Active Users (Approved Accounts)<br>• Fuel Entries<br>• Flagged Records (Misuse Detection) |
| **KPI Layout** | 4-5 column grid (md:grid-cols-2 xl:grid-cols-5) with accent colors (slate-950/white/emerald/sky/rose) |
| **Charts** | None (summary dashboard only) |
| **Filters** | Refresh button for real-time data |
| **Export Buttons** | Refresh button (RefreshCw icon) |
| **Alerts** | None (clean summary view) |
| **Color Patterns** | Slate-950 dark card, white text, color-coded icon backgrounds (emerald-600, sky-600, rose-600) |
| **Additional Features** | Recent fuel activity table, hover animations (-translate-y-0.5), shadow effects |

---

### 2. Admin Reports Hub
**Location:** `/frontend/src/app/dashboards/admin/reports/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | Large heading (h1: text-3xl), subtitle with description |
| **KPIs** | • Total Fuel Cost (TrendingUp icon)<br>• Maintenance Spend (Activity icon)<br>• Total Distance<br>• Avg. Efficiency |
| **KPI Layout** | 4-column grid (md:grid-cols-4) using Card component |
| **Charts** | None (landing page) |
| **Filters** | None |
| **Export Buttons** | None |
| **Alerts** | None |
| **Color Patterns** | Primary colors for icons (muted-foreground), consistent Card styling |
| **Additional Features** | Report cards as navigation links (hover effects), 30-second real-time polling |

---

### 3. Driver Analytics Overview
**Location:** `/frontend/src/app/dashboards/admin/reports/drivers/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | h1 (text-3xl) with description, Date filter dropdown (Last 30 Days), Export Full Report button |
| **KPIs** | • Total Drivers (Users icon, blue bg)<br>• Average Safety Score (Trophy icon, green bg)<br>• High Risk Drivers (ShieldAlert icon, red bg)<br>• Doc Compliance (FileCheck icon, amber bg) |
| **KPI Layout** | 4-column grid (lg:grid-cols-4) with color-coded cards, hover effects |
| **Charts** | Top Driver Performance (Bar chart: score vs rating) |
| **Filters** | Date range filter (Last 30 Days button)<br>Quick links: Infractions, Profile, Leaves, Documents |
| **Export Buttons** | "Export Full Report" button (slate-900 bg) |
| **Alerts** | None in this overview |
| **Color Patterns** | Blue-50/blue-600, green-50/green-600, red-50/red-600, amber-50/amber-600 with hover:scale-110 |
| **Additional Features** | Quick navigation pills, TrendingUp indicators, group hover effects |

---

### 4. Driver Document Tracking
**Location:** `/frontend/src/app/dashboards/admin/reports/drivers/documents/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | h1 (text-3xl), description, Bulk Upload & Remind Missing Docs buttons |
| **KPIs** | • License Copies (88%)<br>• Insurance Proof (94%)<br>• Medical Certs (72%)<br>• Background Checks (100%) |
| **KPI Layout** | 4-column grid with compliance matrix (colored by status: green/red) |
| **Charts** | Progress bars for each document type |
| **Filters** | None visible |
| **Export Buttons** | Bulk Upload button, Remind Missing Docs button (red-600) |
| **Alerts** | **Alert Card**: "Immediate Action Required - 7 drivers missing Medical Certificates" (amber-50 bg, amber-500 left border) |
| **Color Patterns** | green-50/green-600 for compliant, red-50/red-600 for missing, with progress bar fills |
| **Additional Features** | Detailed audit master list table with View Documents (Eye icon) & Download ZIP (Download icon) buttons per driver |

---

### 5. Driver Infraction Analytics
**Location:** `/frontend/src/app/dashboards/admin/reports/drivers/infractions/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | h1 (text-3xl) with description |
| **KPIs** | • Total Violations (red trend)<br>• Pending Review (amber-600)<br>• Critical Risk Level (red-50 bg card, red-600 text)<br>• Resolution Rate (green-600 text) |
| **KPI Layout** | 4-column grid (lg:grid-cols-4) with mixed backgrounds (border-none shadow-sm) |
| **Charts** | • Incident Severity Distribution (Pie/Donut: inner radius 60, outer 80)<br>• Infraction Type Frequency (Horizontal Bar Chart) |
| **Filters** | Search input for driver/type filtering |
| **Export Buttons** | None visible |
| **Alerts** | Implicit via red card (Critical Risk Level) |
| **Color Patterns** | COLORS array: green (#10b981), amber (#f59e0b), red (#ef4444), blue (#3b82f6) |
| **Additional Features** | Violation History Log table with Incident ID, Driver, Type, Date, Severity, Points, Status columns |

---

### 6. Driver Leave Analytics
**Location:** `/frontend/src/app/dashboards/admin/reports/drivers/leaves/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | h1 (text-3xl), description |
| **KPIs** | • Active Leaves (Palmtree icon, amber-50 bg)<br>• Avg Monthly Absences (Activity icon, blue-50 bg)<br>• Sick Leave Rate (Stethoscope icon, red-50 bg)<br>• Fleet Capability (Users icon, green-50 bg) |
| **KPI Layout** | 4-column grid with icon+text layout per card |
| **Charts** | • Periodic Absence Volatility (Line chart showing leave incidents weekly)<br>• Leave Type Distribution (Donut pie: inner 70, outer 95) |
| **Filters** | None |
| **Export Buttons** | None |
| **Alerts** | None |
| **Color Patterns** | COLORS: red (#ef4444), green (#10b981), amber (#f59e0b), blue (#3b82f6) |
| **Additional Features** | Fleet Absence History table (Driver Name, From Date, To Date, Absence Type, Status) with status badges |

---

### 7. Driver Profile Analysis
**Location:** `/frontend/src/app/dashboards/admin/reports/drivers/profile/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | Flex layout with h1, description, and avatar stack (-space-x-3) of first 5 drivers |
| **KPIs** | None (distribution-focused) |
| **KPI Layout** | N/A |
| **Charts** | • Experience Segmentation (Donut pie: inner 70, outer 90)<br>• Departmental Alignment (Bar chart: Logistics, Staff Tx, Corporate, Support) |
| **Filters** | None |
| **Export Buttons** | None |
| **Alerts** | None |
| **Color Patterns** | COLORS: blue (#3b82f6), green (#10b981), amber (#f59e0b), purple (#8b5cf6), indigo (#6366f1) |
| **Additional Features** | Personnel Identity Grid showing driver cards with avatar, name, ID, department, location, join date, status badge |

---

### 8. Export Center
**Location:** `/frontend/src/app/dashboards/admin/reports/export/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | h1 (text-4xl font-black), subtitle (text-slate-500) |
| **KPIs** | None (export portal) |
| **KPI Layout** | N/A |
| **Charts** | None |
| **Filters** | **Date Range Section** (prominent border-2 border-indigo-200, indigo-600 header)<br>• Start Date picker<br>• End Date picker<br>• Apply/Reset buttons |
| **Export Buttons** | Multiple export sections:<br>• Overall Summary (PDF/Excel)<br>• Vehicle Reports (PDF/Excel)<br>• Driver Reports (PDF/Excel)<br>• Category Reports: Maintenance, Fuel, Rental (PDF/Excel)<br>• Specific Vehicle Logs (Fuel/Maintenance) |
| **Alerts** | None |
| **Color Patterns** | Indigo-200 border, indigo-600 headers, white/slate backgrounds |
| **Additional Features** | Dropdown selectors for vehicle/driver selection, date range with persistent state |

---

### 9. Fuel Analysis Dashboard
**Location:** `/frontend/src/app/dashboards/admin/reports/fuel/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | Flex header with h1 (text-3xl), Fuel icon (amber-500), description, Date range button |
| **KPIs** | • Total Expenditure (DollarSign icon, blue-50 bg, blue-600)<br>• Consumption Volume (Droplets icon, amber-50 bg, amber-600)<br>• Avg Efficiency (Navigation icon, green-50 bg, green-600)<br>• Avg Price/L (Fuel icon, purple-50 bg, purple-600) |
| **KPI Layout** | 4-column grid (lg:grid-cols-4) with flex layout, sub-stats in colored text |
| **Charts** | • Spend & Volume Trajectory (Area chart with gradient)<br>• Departmental Spend (Bar chart)<br>• Station Distribution (Pie chart) |
| **Filters** | **Date Picker Button** with inline dropdown showing:<br>• Start Date input<br>• End Date input<br>• RESET/APPLY buttons<br>Search box for vehicle/station filtering |
| **Export Buttons** | Date-contextual (shows "Select Period") |
| **Alerts** | None |
| **Color Patterns** | Blue, amber, green, purple theme; transparent fill gradients for area charts |
| **Additional Features** | Dynamic date range display, search filter state, real-time calculations |

---

### 10. Maintenance Analytics
**Location:** `/frontend/src/app/dashboards/admin/reports/maintenance/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | Flex layout with h1 (text-3xl), description, Last 30 Days & Filters buttons |
| **KPIs** | • Actual Spend (DollarSign icon, amber-50 bg, amber-600, TrendingUp/Down %)<br>• Avg. Downtime (Timer icon, blue-50 bg, blue-600)<br>• Breakdowns (AlertTriangle icon, red-50 bg, red-600)<br>• Compliance (CheckCircle2 icon, green-50 bg, green-600) |
| **KPI Layout** | 4-column grid with icon + variance indicator |
| **Charts** | • Cost Comparison (Bar chart: Estimated vs Actual)<br>• Maintenance Types (Pie chart: Routine, Breakdown, Accident, Inspection) |
| **Filters** | Calendar filter (Last 30 Days), Filters button |
| **Export Buttons** | None visible |
| **Alerts** | None |
| **Color Patterns** | COLORS: amber (#f59e0b), red (#ef4444), blue (#3b82f6), green (#10b981) |
| **Additional Features** | Budget variance tracking, downtime trend analysis |

---

### 11. Driver Performance Analytics
**Location:** `/frontend/src/app/dashboards/admin/reports/performance/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | Flex with h1 (text-3xl), Award icon, description, Fleet Safety Score badge (indigo-50 bg) |
| **KPIs** | • Avg Fleet Rating (Star icon, amber-500, amber-50 bg)<br>• Active Personnel (UserCheck icon, green-500, green-50 bg)<br>• Total Distance (Navigation icon, blue-500, blue-50 bg)<br>• Compliance Rate (ShieldCheck icon, indigo-500, indigo-50 bg) |
| **KPI Layout** | 4-column grid with flex justify-between layout |
| **Charts** | • Productivity vs. Quality (Bar chart: Total Trips vs Rating)<br>• Top Performer Card (indigo-900 bg with Award watermark) |
| **Filters** | None |
| **Export Buttons** | None |
| **Alerts** | Implicit via "Top Performer" card highlighting |
| **Color Patterns** | Star-amber, UserCheck-green, Navigation-blue, ShieldCheck-indigo |
| **Additional Features** | Top Performer spotlight card with stats, Driver Efficiency Registry table |

---

### 12. Rental Analytics
**Location:** `/frontend/src/app/dashboards/admin/reports/rentals/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | Flex with h1 (text-3xl), description, Search input (pl-10 for icon) |
| **KPIs** | • Total Expense (indigo-600 to indigo-700 gradient bg, white text, DollarSign icon)<br>• Avg. Daily Rate (white bg, Clock icon)<br>• Rental Days (white bg, Calendar icon)<br>• Fleet Rented % (white bg, Car icon, progress bar) |
| **KPI Layout** | 4-column grid, first card is gradient, rest are white |
| **Charts** | • Spending Trajectory (Area chart with gradient fill)<br>• Rental Type Distribution (implied)<br>• Purpose Distribution (Radar/Pie) |
| **Filters** | Search box for customer/license plate |
| **Export Buttons** | None visible in code |
| **Alerts** | None |
| **Color Patterns** | Indigo gradient, white backgrounds, progress bar visualization |
| **Additional Features** | Utilization percentage with progress bar, purpose icons for categorization |

---

### 13. Vehicle Utilization & Trip Management
**Location:** `/frontend/src/app/dashboards/admin/reports/utilization/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | Flex with h1 (text-3xl), description, Fleet Utilization badge (Activity icon, amber-400) |
| **KPIs** | • Total Requests (Calendar icon, blue-600, blue-50 bg)<br>• Pending Approval (Clock icon, amber-600, amber-50 bg)<br>• Active Trips (PlayCircle icon, green-600, green-50 bg)<br>• Completed (CheckCircle2 icon, purple-600, purple-50 bg) |
| **KPI Layout** | 4-column grid (lg:grid-cols-4) |
| **Charts** | • Trip Request Distribution (Bar chart by department)<br>• Trip Execution Velocity (Area chart: completed vs cancelled by day)<br>• Staff Approval Efficiency (Pie chart: Approved vs Rejected) |
| **Filters** | None |
| **Export Buttons** | None visible |
| **Alerts** | None |
| **Color Patterns** | COLORS: green (#10b981), red (#ef4444), amber (#f59e0b), blue (#3b82f6) |
| **Additional Features** | Fleet Utilization Registry table, 7-day completion trend |

---

## DRIVER DASHBOARDS

### 1. Driver Main Dashboard
**Location:** `/frontend/src/app/dashboards/driver/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | DashboardShell component (title, description) |
| **KPIs** | • My Trips (Assigned - MapPin icon)<br>• Leave Requests (Managed - CalendarDays icon) |
| **KPI Layout** | Grid (gap-4, sm:grid-cols-2, xl:grid-cols-4) |
| **Charts** | None |
| **Filters** | None |
| **Export Buttons** | None |
| **Alerts** | None |
| **Color Patterns** | Amber accents (amber-100, amber-700), rounded-[24px] cards, border border-slate-200 |
| **Additional Features** | Feature highlight cards, Quick Links (Profile, Documents, My Trips), Dark sidebar section with features list |

---

### 2. Driver Leave Requests
**Location:** `/frontend/src/app/dashboards/driver/leave-requests/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | Card-based (CardHeader, CardTitle "My Leave Requests") with Request Leave button |
| **KPIs** | Count display per filter status |
| **KPI Layout** | N/A |
| **Charts** | None |
| **Filters** | **Status Filter Pills**: ALL, PENDING, APPROVED, REJECTED with counts |
| **Export Buttons** | None |
| **Alerts** | None |
| **Color Patterns** | STATUS_STYLES: amber-300/50/800, green-300/50/800, red-300/50/800, slate-300/100/700 |
| **Additional Features** | Leave request form dialog, individual request cards with status badges, Cancel Request button, approval notes display |

---

### 3. Driver Profile
**Location:** `/frontend/src/app/dashboards/driver/profile/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | DashboardShell (title: "My Profile", description) |
| **KPIs** | Driver Rating percentage (Star visualization 1.25rem stars) |
| **KPI Layout** | N/A |
| **Charts** | None |
| **Filters** | None |
| **Export Buttons** | Profile Picture upload/remove buttons |
| **Alerts** | **Infraction Warning Section** (border-1 amber border, amber-50 bg, amber-85 text) when infractions exist |
| **Color Patterns** | Green (ACTIVE), Gray (INACTIVE), Red (SUSPENDED) status pills<br>Gradient banner (blue to amber gradient) |
| **Additional Features** | Profile picture with preview/remove, Info rows with icons, Certifications section, Infraction warnings with severity/status |

---

### 4. Driver Trips
**Location:** `/frontend/src/app/dashboards/driver/trips/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | DashboardShell (title: "My Trips", description) |
| **KPIs** | None (list-based) |
| **KPI Layout** | N/A |
| **Charts** | None |
| **Filters** | None |
| **Export Buttons** | None |
| **Alerts** | None |
| **Color Patterns** | statusStyles: APPROVED (green-50/700), ONGOING (purple-50/700), COMPLETED (blue-50/700), CANCELLED (slate-100/500) |
| **Additional Features** | Trip cards (grid lg:grid-cols-2) with gradient top border (blue-400 to purple-400), icon badges (MapPin, Calendar, ArrowRight, Users, Car), Confirm/Reject trip buttons, dialog for rejection reason |

---

### 5. Driver Documents (Redirect)
**Location:** `/frontend/src/app/dashboards/driver/documents/page.tsx`
- **Status**: Redirects to `/dashboards/driver/profile`

### 6. Driver Licenses (Redirect)
**Location:** `/frontend/src/app/dashboards/driver/licenses/page.tsx`
- **Status**: Redirects to `/dashboards/driver/profile`

---

## APPROVER DASHBOARD

### 1. Approver Dashboard
**Location:** `/frontend/src/app/dashboards/approver/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | DashboardShell (title: "Approver Dashboard", description) |
| **KPIs** | • Approval queue (Ready - Clock3 icon)<br>• Decision history (Tracked - FileCheck2 icon) |
| **KPI Layout** | Grid (gap-4, md:grid-cols-2) |
| **Charts** | None |
| **Filters** | None |
| **Export Buttons** | None |
| **Alerts** | None |
| **Color Patterns** | Amber accents, slate-900 dark card section with amber-300 text, white/80 backdrop |
| **Additional Features** | Feature highlight cards, "Next capabilities" list with CheckCircle2 icons, structured for future modules |

---

## STAFF DASHBOARD

### 1. Staff Dashboard
**Location:** `/frontend/src/app/dashboards/staff/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | DashboardShell (title: "Staff Dashboard", description) |
| **KPIs** | • Request workspace (Prepared - ClipboardList icon)<br>• Fuel history (Consistent - Droplets icon) |
| **KPI Layout** | Grid (gap-4, md:grid-cols-2) |
| **Charts** | None |
| **Filters** | None |
| **Export Buttons** | None |
| **Alerts** | None |
| **Color Patterns** | Amber accents, similar to driver dashboard |
| **Additional Features** | Placeholder dashboard for future modules |

---

### 2. Staff Profile
**Location:** `/frontend/src/app/dashboards/staff/profile/page.tsx`

| Attribute | Details |
|-----------|---------|
| **Header Style** | DashboardShell (title: "My Profile", description) |
| **KPIs** | None |
| **KPI Layout** | N/A |
| **Charts** | None |
| **Filters** | None |
| **Export Buttons** | Profile picture upload/remove buttons |
| **Alerts** | None |
| **Color Patterns** | Gradient banner (blue-220/30 to amber-42/100), status pills (APPROVED green, PENDING amber, REJECTED red) |
| **Additional Features** | Avatar with gradient banner, profile picture preview, Info rows with icons, Edit profile form with react-hook-form |

---

## SUMMARY TABLE

| Dashboard Page | Header Style | KPIs Count | Charts Count | Filters | Export? | Alerts | Color Primary |
|---|---|---|---|---|---|---|---|
| Admin Main | PageHeader | 4 | 0 | Refresh | Yes | None | Slate-950/white |
| Admin Reports Hub | h1 Large | 4 | 0 | None | No | None | Primary |
| Driver Analytics Overview | h1 + Buttons | 4 | 1 | Date+Links | Yes | None | Blue/Green/Red/Amber |
| Driver Documents | h1 + Buttons | 4 | Progress bars | None | Yes | Alert (Amber) | Green/Red |
| Driver Infractions | h1 + Description | 4 | 2 | Search | No | Red card | Green/Amber/Red/Blue |
| Driver Leaves | h1 + Description | 4 | 2 | None | No | None | Red/Green/Amber/Blue |
| Driver Profile Analysis | h1 + Avatars | 0 | 2 | None | No | None | Blue/Green/Amber/Purple |
| Export Center | h1 Black | 0 | 0 | **Date Range** | **Yes (10+ types)** | None | Indigo-600 |
| Fuel Analysis | h1 + Icon | 4 | 3 | **Date+Search** | Yes | None | Blue/Amber/Green/Purple |
| Maintenance | h1 + Buttons | 4 | 2 | Calendar/Filter | No | None | Amber/Red/Blue/Green |
| Performance | h1 + Award | 4 | 2 | None | No | None | Amber/Green/Blue/Indigo |
| Rentals | h1 + Search | 4 | 3 | Search | No | None | Indigo |
| Utilization | h1 + Badge | 4 | 3 | None | No | None | Green/Red/Amber/Blue |
| Driver Main | DashboardShell | 2 | 0 | None | No | None | Amber |
| Driver Leaves | CardHeader | Varies | 0 | Status Pills | No | None | Amber/Green/Red/Slate |
| Driver Profile | DashboardShell | 1 | 0 | None | Yes | **Alert (Amber)** | Green/Gray/Red |
| Driver Trips | DashboardShell | 0 | 0 | None | No | None | Green/Purple/Blue/Slate |
| Approver Main | DashboardShell | 2 | 0 | None | No | None | Amber |
| Staff Main | DashboardShell | 2 | 0 | None | No | None | Amber |
| Staff Profile | DashboardShell | 0 | 0 | None | Yes | None | Gradient Banner |

---

## KEY PATTERNS IDENTIFIED

### Design Consistency:
1. **Card Components**: Rounded-[24px], border border-slate-200, shadow-sm, hover:-translate-y-0.5
2. **Headers**: PageHeader component OR h1 (text-3xl) with description
3. **KPI Grids**: Responsive (md:grid-cols-2/4, lg:grid-cols-4)
4. **Color Coding**:
   - **Status**: Green (Active/Good), Amber (Warning/Pending), Red (Error/Critical), Blue (Info)
   - **Charts**: Recharts with 5-color palette (blue, green, amber, red, purple)
   - **Icons**: Color-matched to data (blue for users, amber for fuel, red for alerts, green for complete)

### Feature Distribution:
- **Admin Reports**: Comprehensive filters, date ranges, export options
- **Driver Portals**: Minimal filters, focus on personal data
- **Utilization Tracking**: Trip-based metrics with execution velocity
- **Compliance**: Document checklists, alerts, progress tracking
- **Alerts**: Used primarily in driver documents and profile pages (amber warnings)

### Export Capabilities:
- **Admin Export Center**: 10+ report types (PDF/Excel), all support date ranges
- **Document Page**: Bulk Upload, Remind buttons
- **Driver Pages**: Profile picture upload/remove only

### Filter Types Present:
1. Date Range Pickers (Fuel, Maintenance, Export Center)
2. Status Pills (Driver Leaves: ALL/PENDING/APPROVED/REJECTED)
3. Search Boxes (Infraction, Rentals, Fuel)
4. Quick Link Pills (Driver Analytics)
5. Filter Buttons (Calendar, Filter toggle)

---

## TECHNICAL NOTES

**Frameworks Used:**
- Recharts for all charts (Bar, Line, Area, Pie, Radar, etc.)
- shadcn/ui Card, Badge, Button components
- Tailwind CSS for styling
- Next.js "use client" for interactivity
- React hooks (useState, useEffect, useCallback, useMemo)

**Component Library:**
- PageHeader for consistent dashboard headers
- DashboardShell for role-based dashboard containers
- Badge for status indicators
- Card/CardContent/CardHeader/CardTitle for content containers
- Dialog for modal forms

**Data Handling:**
- Async API calls with error handling
- Loading states (LoadingSpinner, Loader2 spinners)
- Real-time polling (30-second intervals in Reports Hub)
- Memoization for performance optimization
