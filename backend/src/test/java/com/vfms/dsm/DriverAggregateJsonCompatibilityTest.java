package com.vfms.dsm;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.vfms.dsm.entity.DriverAggregate.DriverCertification;
import com.vfms.dsm.entity.DriverAggregate.DriverInfraction;
import com.vfms.dsm.entity.DriverAggregate.DriverLeave;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DriverAggregateJsonCompatibilityTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void deserializesLegacySnakeCaseCertificationJson() throws Exception {
        String json = """
                [{
                  "id": 42,
                  "driver_id": "6e6822db-2940-43c6-9c38-2b58cb2d2793",
                  "cert_type": "DEFENSIVE_DRIVING",
                  "cert_name": "Defensive Driving",
                  "issued_by": "Road Safety Institute",
                  "issue_date": "2025-01-10",
                  "expiry_date": "2027-01-10",
                  "document_url": "/uploads/certification.pdf",
                  "status": "VALID",
                  "created_at": "2025-01-10T08:30:00+00:00",
                  "updated_at": "2025-01-11T09:45:00+05:30"
                }]
                """;

        List<DriverCertification> certifications = objectMapper.readValue(
                json, new TypeReference<List<DriverCertification>>() {});

        DriverCertification certification = certifications.getFirst();
        assertEquals(42L, certification.getId());
        assertEquals(DriverCertification.CertificationType.DEFENSIVE_DRIVING, certification.getCertType());
        assertEquals("Defensive Driving", certification.getCertName());
        assertEquals("Road Safety Institute", certification.getIssuedBy());
        assertEquals(LocalDate.of(2025, 1, 10), certification.getIssueDate());
        assertEquals(LocalDate.of(2027, 1, 10), certification.getExpiryDate());
        assertEquals("/uploads/certification.pdf", certification.getDocumentUrl());
        assertEquals(DriverCertification.CertStatus.VALID, certification.getStatus());
        assertEquals(LocalDateTime.of(2025, 1, 10, 8, 30), certification.getCreatedAt());
        assertEquals(LocalDateTime.of(2025, 1, 11, 9, 45), certification.getUpdatedAt());
    }

    @Test
    void continuesToDeserializeCamelCaseCertificationJson() throws Exception {
        String json = """
                [{
                  "id": 43,
                  "certType": "FIRST_AID",
                  "certName": "First Aid",
                  "issueDate": "2025-02-01",
                  "status": "VALID",
                  "createdAt": "2025-02-01T10:00:00"
                }]
                """;

        DriverCertification certification = objectMapper.readValue(
                json, new TypeReference<List<DriverCertification>>() {}).getFirst();

        assertEquals(DriverCertification.CertificationType.FIRST_AID, certification.getCertType());
        assertEquals("First Aid", certification.getCertName());
        assertEquals(LocalDate.of(2025, 2, 1), certification.getIssueDate());
        assertEquals(LocalDateTime.of(2025, 2, 1, 10, 0), certification.getCreatedAt());
    }

    @Test
    void deserializesLegacySnakeCaseInfractionJson() throws Exception {
        String json = """
                [{
                  "id": 51,
                  "driver_id": "6e6822db-2940-43c6-9c38-2b58cb2d2793",
                  "infraction_type": "TRAFFIC_VIOLATION",
                  "severity": "HIGH",
                  "incident_date": "2026-04-12",
                  "description": "Speeding report",
                  "resolution_status": "UNDER_REVIEW",
                  "resolved_at": null,
                  "penalty_notes": "Pending review",
                  "created_at": "2026-04-12T08:30:00+00:00",
                  "updated_at": "2026-04-12T09:00:00+05:30"
                }]
                """;

        DriverInfraction infraction = objectMapper.readValue(
                json, new TypeReference<List<DriverInfraction>>() {}).getFirst();

        assertEquals(51L, infraction.getId());
        assertEquals(DriverInfraction.InfractionType.TRAFFIC_VIOLATION, infraction.getInfractionType());
        assertEquals(DriverInfraction.Severity.HIGH, infraction.getSeverity());
        assertEquals(LocalDate.of(2026, 4, 12), infraction.getIncidentDate());
        assertEquals(DriverInfraction.ResolutionStatus.UNDER_REVIEW, infraction.getResolutionStatus());
        assertEquals("Pending review", infraction.getPenaltyNotes());
        assertEquals(LocalDateTime.of(2026, 4, 12, 8, 30), infraction.getCreatedAt());
    }

    @Test
    void continuesToDeserializeCamelCaseInfractionJson() throws Exception {
        String json = """
                [{
                  "id": 52,
                  "infractionType": "NEAR_MISS",
                  "severity": "LOW",
                  "incidentDate": "2026-05-03",
                  "resolutionStatus": "OPEN",
                  "createdAt": "2026-05-03T10:15:00"
                }]
                """;

        DriverInfraction infraction = objectMapper.readValue(
                json, new TypeReference<List<DriverInfraction>>() {}).getFirst();

        assertEquals(DriverInfraction.InfractionType.NEAR_MISS, infraction.getInfractionType());
        assertEquals(DriverInfraction.Severity.LOW, infraction.getSeverity());
        assertEquals(LocalDate.of(2026, 5, 3), infraction.getIncidentDate());
        assertEquals(DriverInfraction.ResolutionStatus.OPEN, infraction.getResolutionStatus());
    }

    @Test
    void deserializesLegacySnakeCaseLeaveJson() throws Exception {
        String json = """
                [{
                  "id": 61,
                  "driver_id": "6e6822db-2940-43c6-9c38-2b58cb2d2793",
                  "leave_type": "ANNUAL",
                  "start_date": "2026-07-01",
                  "end_date": "2026-07-03",
                  "reason": "Family event",
                  "status": "PENDING",
                  "approved_by": null,
                  "approval_notes": null,
                  "created_at": "2026-06-20T08:30:00+00:00",
                  "updated_at": "2026-06-20T09:00:00+05:30"
                }]
                """;

        DriverLeave leave = objectMapper.readValue(
                json, new TypeReference<List<DriverLeave>>() {}).getFirst();

        assertEquals(61L, leave.getId());
        assertEquals(DriverLeave.LeaveType.ANNUAL, leave.getLeaveType());
        assertEquals(LocalDate.of(2026, 7, 1), leave.getStartDate());
        assertEquals(LocalDate.of(2026, 7, 3), leave.getEndDate());
        assertEquals(DriverLeave.LeaveStatus.PENDING, leave.getStatus());
        assertEquals(LocalDateTime.of(2026, 6, 20, 8, 30), leave.getCreatedAt());
    }
}
