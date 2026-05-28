import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// This service is now 100% Live. It only uses data passed into it or fetched from the backend.

export const exportService = {
    // ====================
    // OVERALL SUMMARY EXPORTS
    // ====================

    exportOverallSummaryPDF: (summary: any) => {
        if (!summary) return;
        const doc = new jsPDF();
        const fileName = `VFMS_Overall_Report_${new Date().toISOString().split('T')[0]}.pdf`;

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('VFMS - Overall Fleet Report', 14, 20);

        // Report Info
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        // Fleet Summary
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Fleet Summary', 14, 50);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        autoTable(doc, {
            startY: 56,
            head: [['Metric', 'Value']],
            body: [
                ['Total Vehicles', (summary.totalVehicles || 0).toString()],
                ['Total Drivers', (summary.totalDrivers || 0).toString()],
                ['Total Trips', (summary.totalTrips || 0).toLocaleString()],
                ['Total Distance (km)', (summary.totalDistance || 0).toLocaleString()],
                ['Average Utilization', `${summary.averageUtilization || 0}%`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [51, 122, 183] }
        });

        const finalY1 = (doc as any).lastAutoTable.finalY + 10;

        // Financial Summary
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Financial Summary', 14, finalY1);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        autoTable(doc, {
            startY: finalY1 + 6,
            head: [['Category', 'Amount ($)']],
            body: [
                ['Total Maintenance Cost', (summary.totalMaintenanceCost || 0).toFixed(2)],
                ['Total Fuel Cost', (summary.totalFuelCost || 0).toFixed(2)],
                ['Total Operating Cost', ((summary.totalMaintenanceCost || 0) + (summary.totalFuelCost || 0)).toFixed(2)]
            ],
            theme: 'grid',
            headStyles: { fillColor: [92, 184, 92] }
        });

        const finalY2 = (doc as any).lastAutoTable.finalY + 10;

        // Driver Performance
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Driver Performance', 14, finalY2);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        autoTable(doc, {
            startY: finalY2 + 6,
            head: [['Metric', 'Value']],
            body: [
                ['Average Driver Rating', `${summary.averageDriverRating || 0}/5.0`],
                ['Total Violations', (summary.totalViolations || 0).toString()]
            ],
            theme: 'grid',
            headStyles: { fillColor: [240, 173, 78] }
        });

        doc.save(fileName);
    },

    exportOverallSummaryExcel: (summary: any) => {
        if (!summary) return;
        const fileName = `VFMS_Overall_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Fleet Summary Sheet
        const fleetData = [
            { Metric: 'Total Vehicles', Value: summary.totalVehicles || 0 },
            { Metric: 'Total Drivers', Value: summary.totalDrivers || 0 },
            { Metric: 'Total Trips', Value: summary.totalTrips || 0 },
            { Metric: 'Total Distance (km)', Value: summary.totalDistance || 0 },
            { Metric: 'Average Utilization (%)', Value: summary.averageUtilization || 0 }
        ];

        // Financial Summary Sheet
        const financialData = [
            { Category: 'Total Maintenance Cost', 'Amount ($)': summary.totalMaintenanceCost || 0 },
            { Category: 'Total Fuel Cost', 'Amount ($)': summary.totalFuelCost || 0 },
            { Category: 'Total Operating Cost', 'Amount ($)': (summary.totalMaintenanceCost || 0) + (summary.totalFuelCost || 0) }
        ];

        // Driver Performance Sheet
        const driverSummaryData = [
            { Metric: 'Average Driver Rating', Value: summary.averageDriverRating || 0 },
            { Metric: 'Total Violations', Value: summary.totalViolations || 0 }
        ];

        const wb = XLSX.utils.book_new();

        const wsFleet = XLSX.utils.json_to_sheet(fleetData);
        const wsFinancial = XLSX.utils.json_to_sheet(financialData);
        const wsDriver = XLSX.utils.json_to_sheet(driverSummaryData);

        XLSX.utils.book_append_sheet(wb, wsFleet, 'Fleet Summary');
        XLSX.utils.book_append_sheet(wb, wsFinancial, 'Financial Summary');
        XLSX.utils.book_append_sheet(wb, wsDriver, 'Driver Performance');

        XLSX.writeFile(wb, fileName);
    },

    // ====================
    // INDIVIDUAL VEHICLE REPORT
    // ====================

    exportVehicleReportPDF: (vehicle: any) => {
        if (!vehicle) {
            alert('No vehicle data to export!');
            return;
        }

        const doc = new jsPDF();
        const fileName = `Vehicle_${(vehicle.licensePlate || 'Unknown').replace(/-/g, '_')}_Report.pdf`;

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`Vehicle Report: ${vehicle.licensePlate || 'N/A'}`, 14, 20);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        // Vehicle Information
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Vehicle Information', 14, 44);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        autoTable(doc, {
            startY: 50,
            head: [['Field', 'Value']],
            body: [
                ['Vehicle ID', (vehicle.id || vehicle.vehicleId || 'N/A').toString()],
                ['License Plate', vehicle.licensePlate || 'N/A'],
                ['Make & Model', `${vehicle.make || ''} ${vehicle.model || ''}`],
                ['Year', (vehicle.year || 'N/A').toString()],
                ['Department', vehicle.department || 'N/A']
            ],
            theme: 'grid',
            headStyles: { fillColor: [51, 122, 183] }
        });

        const finalY1 = (doc as any).lastAutoTable.finalY + 10;

        // Performance Metrics
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Performance Metrics', 14, finalY1);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        autoTable(doc, {
            startY: finalY1 + 6,
            head: [['Metric', 'Value']],
            body: [
                ['Total Trips', (vehicle.totalTrips || 0).toString()],
                ['Total Distance (km)', (vehicle.totalDistance || 0).toLocaleString()],
                ['Fuel Consumed (L)', (vehicle.fuelConsumed || 0).toLocaleString()]
            ],
            theme: 'grid',
            headStyles: { fillColor: [92, 184, 92] }
        });

        doc.save(fileName);
    },

    exportVehicleReportExcel: (vehicle: any) => {
        if (!vehicle) return;
        const fileName = `Vehicle_${(vehicle.licensePlate || 'Unknown').replace(/-/g, '_')}_Report.xlsx`;

        const data = [
            { Field: 'Vehicle ID', Value: vehicle.id || vehicle.vehicleId || 'N/A' },
            { Field: 'License Plate', Value: vehicle.licensePlate || 'N/A' },
            { Field: 'Make & Model', Value: `${vehicle.make || ''} ${vehicle.model || ''}` },
            { Field: 'Year', Value: vehicle.year || 'N/A' },
            { Field: 'Department', Value: vehicle.department || 'N/A' },
            { Field: 'Total Trips', Value: vehicle.totalTrips || 0 },
            { Field: 'Total Distance (km)', Value: vehicle.totalDistance || 0 },
            { Field: 'Fuel Consumed (L)', Value: vehicle.fuelConsumed || 0 }
        ];

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Report');
        XLSX.writeFile(wb, fileName);
    },

    // ====================
    // INDIVIDUAL DRIVER REPORT
    // ====================

    exportDriverReportPDF: (driver: any) => {
        if (!driver) {
            alert('No driver data to export!');
            return;
        }

        const doc = new jsPDF();
        const name = driver.driverName || driver.name || 'Unknown';
        const fileName = `Driver_${name.replace(/ /g, '_')}_Report.pdf`;

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`Driver Report: ${name}`, 14, 20);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        autoTable(doc, {
            startY: 40,
            head: [['Field', 'Value']],
            body: [
                ['Driver ID', (driver.id || driver.driverId || 'N/A').toString()],
                ['Name', name],
                ['License Number', driver.licenseNumber || 'N/A'],
                ['Department', driver.department || 'N/A'],
                ['Total Trips', (driver.totalTrips || 0).toString()],
                ['Total Distance (km)', (driver.totalDistance || 0).toLocaleString()],
                ['Rating', `${driver.rating || 0}/5.0`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246] }
        });

        doc.save(fileName);
    },

    exportDriverReportExcel: (driver: any) => {
        if (!driver) return;
        const name = driver.driverName || driver.name || 'Unknown';
        const fileName = `Driver_${name.replace(/ /g, '_')}_Report.xlsx`;
        const data = [
            { Field: 'Driver ID', Value: driver.id || driver.driverId || 'N/A' },
            { Field: 'Name', Value: name },
            { Field: 'License Number', Value: driver.licenseNumber || 'N/A' },
            { Field: 'Department', Value: driver.department || 'N/A' },
            { Field: 'Total Trips', Value: driver.totalTrips || 0 },
            { Field: 'Total Distance (km)', Value: driver.totalDistance || 0 },
            { Field: 'Rating', Value: driver.rating || 0 }
        ];

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Driver Report');
        XLSX.writeFile(wb, fileName);
    },

    // ====================
    // MAINTENANCE EXPORT
    // ====================

    exportMaintenancePDF: (records: any[], startDate?: string, endDate?: string) => {
        const doc = new jsPDF();
        let periodText = 'All Time';
        if (startDate && endDate) periodText = `${startDate} to ${endDate}`;

        doc.setFontSize(18);
        doc.text('Maintenance Cost Report', 14, 20);

        doc.setFontSize(11);
        doc.text('Generated on: ' + new Date().toLocaleDateString(), 14, 30);
        doc.text('Period: ' + periodText, 14, 36);

        const totalCost = (records || []).reduce((sum, item) => sum + (item.cost || 0), 0);
        doc.text(`Total Maintenance Cost: $${totalCost.toFixed(2)}`, 14, 46);

        autoTable(doc, {
            startY: 54,
            head: [['Date', 'Vehicle', 'Type', 'Cost ($)']],
            body: (records || []).map(item => [
                item.maintenanceDate || item.serviceDate || '-',
                item.vehicleId || 'N/A',
                item.type || item.serviceType || '-',
                (item.cost || 0).toFixed(2)
            ])
        });

        doc.save(`maintenance_report.pdf`);
    },

    exportMaintenanceExcel: (records: any[]) => {
        const data = (records || []).map(item => ({
            Date: item.maintenanceDate || item.serviceDate || '-',
            Vehicle: item.vehicleId || 'N/A',
            'Service Type': item.type || item.serviceType || '-',
            'Description': item.description || '',
            'Cost ($)': item.cost || 0
        }));

        const totalCost = (records || []).reduce((sum, item) => sum + (item.cost || 0), 0);
        data.push({
            Date: 'TOTAL',
            Vehicle: '',
            'Service Type': '',
            Description: '',
            'Cost ($)': totalCost
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Report');
        XLSX.writeFile(wb, `maintenance_report.xlsx`);
    },

    // ====================
    // FUEL ANALYSIS EXPORT
    // ====================

    exportFuelPDF: (records: any[], startDate?: string, endDate?: string) => {
        const doc = new jsPDF();
        let periodText = 'All Time';
        if (startDate && endDate) periodText = `${startDate} to ${endDate}`;

        doc.setFontSize(18);
        doc.text('Fuel Analysis Report', 14, 20);

        doc.setFontSize(11);
        doc.text('Generated on: ' + new Date().toLocaleDateString(), 14, 30);
        doc.text('Period: ' + periodText, 14, 36);

        const totalCost = (records || []).reduce((sum, item) => sum + (item.totalCost || 0), 0);
        const totalQuantity = (records || []).reduce((sum, item) => sum + (item.fuelQuantity || 0), 0);
        doc.text(`Total Fuel Cost: $${totalCost.toFixed(2)}`, 14, 46);
        doc.text(`Total Quantity: ${totalQuantity.toFixed(2)} L`, 14, 52);

        autoTable(doc, {
            startY: 60,
            head: [['Date', 'Vehicle', 'Quantity (L)', 'Cost ($)']],
            body: (records || []).map(item => [
                item.date || '-',
                item.licensePlate || item.vehicleId || 'N/A',
                (item.fuelQuantity || 0).toFixed(2),
                (item.totalCost || 0).toFixed(2)
            ])
        });

        doc.save(`fuel_analysis_report.pdf`);
    },

    exportFuelExcel: (records: any[]) => {
        const data = (records || []).map(item => ({
            Date: item.date || '-',
            Vehicle: item.licensePlate || item.vehicleId || 'N/A',
            'Quantity (L)': item.fuelQuantity || 0,
            'Price/L': item.pricePerLiter || 0,
            'Total Cost ($)': item.totalCost || 0,
            'Station': item.fuelStation || ''
        }));

        const totalCost = (records || []).reduce((sum, item) => sum + (item.totalCost || 0), 0);
        const totalQuantity = (records || []).reduce((sum, item) => sum + (item.fuelQuantity || 0), 0);
        data.push({
            Date: 'TOTAL',
            Vehicle: '',
            'Quantity (L)': totalQuantity,
            'Price/L': 0,
            'Total Cost ($)': totalCost,
            Station: ''
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Fuel Analysis');
        XLSX.writeFile(wb, `fuel_analysis_report.xlsx`);
    },

    // ====================
    // RENTAL EXPORT
    // ====================

    exportRentalPDF: (records: any[]) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Rental Bookings Report', 14, 20);

        doc.setFontSize(11);
        doc.text('Generated on: ' + new Date().toLocaleDateString(), 14, 30);

        autoTable(doc, {
            startY: 40,
            head: [['Customer', 'Vehicle', 'Start Date', 'End Date', 'Revenue ($)']],
            body: (records || []).map(item => [
                item.customerName || '-',
                item.licensePlate || '-',
                item.startDate || '-',
                item.endDate || '-',
                (item.totalCost || 0).toFixed(2)
            ])
        });

        doc.save(`rental_report.pdf`);
    },

    exportRentalExcel: (records: any[]) => {
        const data = (records || []).map(item => ({
            Customer: item.customerName || '-',
            Vehicle: item.licensePlate || '-',
            'Start Date': item.startDate || '-',
            'End Date': item.endDate || '-',
            'Cost ($)': item.totalCost || 0,
            Status: item.status || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rental Report');
        XLSX.writeFile(wb, `rental_report.xlsx`);
    }
};
