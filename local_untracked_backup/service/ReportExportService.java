package com.vfms.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.vfms.dto.CostAnalysisDTO;
import com.vfms.dto.DriverPerformanceDTO;
import com.vfms.dto.VehicleUtilizationDTO;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final ReportService reportService;

    public byte[] exportReport(String type, String format) throws IOException {
        if ("pdf".equalsIgnoreCase(format)) {
            return generatePdf(type);
        } else if ("excel".equalsIgnoreCase(format)) {
            return generateExcel(type);
        } else {
            throw new IllegalArgumentException("Unsupported format: " + format);
        }
    }

    private byte[] generatePdf(String type) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            font.setSize(18);
            font.setColor(java.awt.Color.BLUE);

            Paragraph p = new Paragraph("VFMS Report: " + type, font);
            p.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(p);
            document.add(new Paragraph("Generated on: " + LocalDate.now()));
            document.add(new Paragraph(" ")); // Spacer

            if ("costs".equalsIgnoreCase(type)) {
                addCostTablePdf(document);
            } else if ("utilization".equalsIgnoreCase(type)) {
                addUtilizationTablePdf(document);
            } else if ("drivers".equalsIgnoreCase(type)) {
                addDriverTablePdf(document);
            }

            document.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new IOException(e);
        }
    }

    private void addCostTablePdf(Document document) throws DocumentException {
        CostAnalysisDTO data = reportService.getCostAnalysis(LocalDate.now().minusMonths(1), LocalDate.now());

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100f);

        addPdfHeader(table, "Metric");
        addPdfHeader(table, "Value");

        table.addCell("Total Fuel Cost");
        table.addCell(String.valueOf(data.getTotalFuelCost()));

        table.addCell("Total Maintenance Cost");
        table.addCell(String.valueOf(data.getTotalMaintenanceCost()));

        document.add(table);
    }

    private void addUtilizationTablePdf(Document document) throws DocumentException {
        List<VehicleUtilizationDTO> data = reportService.getVehicleUtilization();

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100f);

        addPdfHeader(table, "Vehicle ID");
        addPdfHeader(table, "License Plate");
        addPdfHeader(table, "Distance (km)");
        addPdfHeader(table, "Fuel (L)");

        for (VehicleUtilizationDTO item : data) {
            table.addCell(String.valueOf(item.getVehicleId()));
            table.addCell(item.getLicensePlate());
            table.addCell(String.valueOf(item.getTotalDistance()));
            table.addCell(String.valueOf(item.getFuelConsumed()));
        }

        document.add(table);
    }

    private void addDriverTablePdf(Document document) throws DocumentException {
        List<DriverPerformanceDTO> data = reportService.getDriverPerformance();

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100f);

        addPdfHeader(table, "Driver ID");
        addPdfHeader(table, "Name");
        addPdfHeader(table, "Trips");
        addPdfHeader(table, "Rating");

        for (DriverPerformanceDTO item : data) {
            table.addCell(String.valueOf(item.getDriverId()));
            table.addCell(item.getDriverName());
            table.addCell(String.valueOf(item.getTotalTrips()));
            table.addCell(String.valueOf(item.getRating()));
        }

        document.add(table);
    }

    private void addPdfHeader(PdfPTable table, String text) {
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
        header.setPhrase(new Phrase(text));
        table.addCell(header);
    }

    private byte[] generateExcel(String type) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(type);

            if ("costs".equalsIgnoreCase(type)) {
                fillCostSheet(sheet);
            } else if ("utilization".equalsIgnoreCase(type)) {
                fillUtilizationSheet(sheet);
            } else if ("drivers".equalsIgnoreCase(type)) {
                fillDriverSheet(sheet);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void fillCostSheet(Sheet sheet) {
        CostAnalysisDTO data = reportService.getCostAnalysis(LocalDate.now().minusMonths(1), LocalDate.now());
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Metric");
        header.createCell(1).setCellValue("Value");

        Row r1 = sheet.createRow(1);
        r1.createCell(0).setCellValue("Total Fuel Cost");
        r1.createCell(1).setCellValue(data.getTotalFuelCost());

        Row r2 = sheet.createRow(2);
        r2.createCell(0).setCellValue("Total Maintenance Cost");
        r2.createCell(1).setCellValue(data.getTotalMaintenanceCost());
    }

    private void fillUtilizationSheet(Sheet sheet) {
        List<VehicleUtilizationDTO> data = reportService.getVehicleUtilization();
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Vehicle ID");
        header.createCell(1).setCellValue("License Plate");
        header.createCell(2).setCellValue("Distance (km)");
        header.createCell(3).setCellValue("Fuel (L)");

        int rowIdx = 1;
        for (VehicleUtilizationDTO item : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(item.getVehicleId());
            row.createCell(1).setCellValue(item.getLicensePlate());
            row.createCell(2).setCellValue(item.getTotalDistance());
            row.createCell(3).setCellValue(item.getFuelConsumed());
        }
    }

    private void fillDriverSheet(Sheet sheet) {
        List<DriverPerformanceDTO> data = reportService.getDriverPerformance();
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Driver ID");
        header.createCell(1).setCellValue("Name");
        header.createCell(2).setCellValue("Trips");
        header.createCell(3).setCellValue("Rating");

        int rowIdx = 1;
        for (DriverPerformanceDTO item : data) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(item.getDriverId().toString());
            row.createCell(1).setCellValue(item.getDriverName());
            row.createCell(2).setCellValue(item.getTotalTrips());
            row.createCell(3).setCellValue(item.getRating());
        }
    }
}
