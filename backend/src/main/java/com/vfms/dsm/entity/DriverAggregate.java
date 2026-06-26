package com.vfms.dsm.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.vfms.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverAggregate {
    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Version
    private long version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String status;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "full_name")
    private String fullName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    @Builder.Default
    private List<DriverLicense> licenses = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    @Builder.Default
    private List<DriverCertification> certifications = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @JsonDeserialize(using = TolerantDocumentListDeserializer.class)
    @Column(nullable = false)
    @Builder.Default
    private List<DriverDocument> documents = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    @Builder.Default
    private List<DriverInfraction> infractions = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    @Builder.Default
    private List<DriverLeave> leaves = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "performance_scores", nullable = false)
    @Builder.Default
    private List<DriverPerformanceScore> performanceScores = new ArrayList<>();

    @Column(name = "readiness_license_valid", nullable = false)
    @Builder.Default
    private Boolean readinessLicenseValid = false;

    @Column(name = "readiness_all_certs_valid", nullable = false)
    @Builder.Default
    private Boolean readinessAllCertsValid = true;

    @Column(name = "readiness_on_leave_today", nullable = false)
    @Builder.Default
    private Boolean readinessOnLeaveToday = false;

    @Column(name = "readiness_not_ready_reason")
    private String readinessNotReadyReason;

    @Column(name = "readiness_last_refreshed")
    private LocalDateTime readinessLastRefreshed;

    @Column(name = "readiness_availability_status")
    private String readinessAvailabilityStatus;

    @PrePersist
    void initialize() {
        if (id == null && user != null) id = user.getId();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null && user != null && user.getStatus() != null) status = user.getStatus().name();
        if (status == null) status = "ACTIVE";
    }

    @Getter
    @Setter
    public abstract static class BaseEntity {
        @JsonAlias("created_at")
        @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
        private LocalDateTime createdAt;

        @JsonAlias("updated_at")
        @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
        private LocalDateTime updatedAt;

        public abstract Long getId();
        public abstract void setId(Long id);
        public abstract User getUser();
        public abstract void setUser(User user);
    }

    /**
     * Tolerant Jackson deserializer for the {@code documents} JSONB column.
     *
     * Handles legacy data issues where the column may contain:
     * - A proper JSON array: [{...}, {...}]
     * - A double-encoded string: "[{...}]"  (stringified once)
     * - A triple-encoded string: "\"[{...}]\""  (stringified twice)
     *
     * In all error cases, returns an empty list so Hibernate entity loading
     * does not crash on corrupt or migrated data.
     */
    public static class TolerantDocumentListDeserializer extends JsonDeserializer<List<DriverDocument>> {
        @Override
        public List<DriverDocument> deserialize(JsonParser parser, DeserializationContext ctx) throws IOException {
            com.fasterxml.jackson.databind.ObjectMapper mapper =
                    (com.fasterxml.jackson.databind.ObjectMapper) parser.getCodec();
            com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(parser);
            try {
                if (node == null || node.isNull()) return new ArrayList<>();

                // Already a JSON array — ideal path
                if (node.isArray()) {
                    return mapper.readerForListOf(DriverDocument.class).readValue(node);
                }

                // Double-encoded: node is a JSON string whose text is the real JSON
                if (node.isTextual()) {
                    String inner = node.asText();
                    if (inner == null || inner.isBlank() || "null".equalsIgnoreCase(inner)) return new ArrayList<>();
                    com.fasterxml.jackson.databind.JsonNode innerNode = mapper.readTree(inner);

                    if (innerNode.isArray()) {
                        return mapper.readerForListOf(DriverDocument.class).readValue(innerNode);
                    }

                    // Triple-encoded: inner is still a string
                    if (innerNode.isTextual()) {
                        String innerInner = innerNode.asText();
                        if (innerInner == null || innerInner.isBlank()) return new ArrayList<>();
                        com.fasterxml.jackson.databind.JsonNode deepNode = mapper.readTree(innerInner);
                        if (deepNode.isArray()) {
                            return mapper.readerForListOf(DriverDocument.class).readValue(deepNode);
                        }
                    }
                }

                return new ArrayList<>();
            } catch (Exception e) {
                // Log and degrade gracefully rather than crashing Hibernate entity loading
                org.slf4j.LoggerFactory.getLogger(DriverAggregate.class)
                        .warn("TolerantDocumentListDeserializer: could not deserialize documents column, returning empty list. Cause: {}", e.getMessage());
                return new ArrayList<>();
            }
        }
    }

    public static class FlexibleLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            String value = parser.getValueAsString();
            if (value == null || value.isBlank()) return null;
            try {
                return LocalDateTime.parse(value);
            } catch (DateTimeParseException ignored) {
                return OffsetDateTime.parse(value).toLocalDateTime();
            }
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DriverLicense extends BaseEntity {
        private Long id;

        @JsonIgnore
        private User user;

        private String licenseNumber;

        private LicenseCategory category;

        private String issuingAuthority;

        private LocalDate issueDate;

        private LocalDate expiryDate;

        private String documentUrl;

        @Builder.Default
        private Boolean isPrimary = false;

        @Builder.Default
        private LicenseStatus status = LicenseStatus.VALID;

        public enum LicenseCategory { A, B, C, CE, D, BE }
        public enum LicenseStatus { VALID, EXPIRING_SOON, EXPIRED }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DriverCertification extends BaseEntity {
        private Long id;

        @JsonIgnore
        private User user;

        @JsonAlias("cert_type")
        private CertificationType certType;

        @JsonAlias("cert_name")
        private String certName;

        @JsonAlias("issued_by")
        private String issuedBy;

        @JsonAlias("issue_date")
        private LocalDate issueDate;

        @JsonAlias("expiry_date")
        private LocalDate expiryDate;

        @JsonAlias("document_url")
        private String documentUrl;

        @Builder.Default
        private CertStatus status = CertStatus.VALID;

        public enum CertificationType {
            DEFENSIVE_DRIVING,
            FIRST_AID,
            HAZMAT,
            HEAVY_VEHICLE,
            PASSENGER_TRANSPORT,
            OTHER
        }

        public enum CertStatus {
            VALID,
            EXPIRING_SOON,
            EXPIRED
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DriverDocument extends BaseEntity {
        private Long id;

        @JsonIgnore
        private User user;

        private DocumentEntityType entityType;

        private Long entityId;

        private String fileName;

        private String fileUrl;

        private String originalFileName;

        private String bucketName;

        private String storagePath;

        private StorageProvider storageProvider;

        private String mimeType;

        private Long fileSize;

        private LocalDateTime uploadedAt;

        public enum DocumentEntityType {
            LICENSE,
            CERTIFICATION,
            PROFILE,
            OTHER
        }

        public enum StorageProvider {
            LOCAL,
            SUPABASE
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DriverInfraction extends BaseEntity {
        private Long id;

        @JsonIgnore
        private User user;

        @JsonAlias("infraction_type")
        private InfractionType infractionType;

        private Severity severity;

        @JsonAlias("incident_date")
        private LocalDate incidentDate;

        private String description;

        @Builder.Default
        @JsonAlias("resolution_status")
        private ResolutionStatus resolutionStatus = ResolutionStatus.OPEN;

        @JsonAlias("resolved_at")
        private LocalDate resolvedAt;

        @JsonAlias("penalty_notes")
        private String penaltyNotes;

        @JsonProperty(value = "driver", access = JsonProperty.Access.READ_ONLY)
        public Map<String, String> getDriverSummary() {
            if (user != null) {
                return Map.of(
                    "fullName", user.getFullName() != null ? user.getFullName() : "",
                    "employeeId", user.getEmployeeId() != null ? user.getEmployeeId() : ""
                );
            }
            return null;
        }

        public enum InfractionType {
            TRAFFIC_VIOLATION,
            MINOR_ACCIDENT,
            MAJOR_ACCIDENT,
            NEAR_MISS,
            RECKLESS_DRIVING,
            OTHER
        }

        public enum Severity {
            LOW,
            MEDIUM,
            HIGH,
            CRITICAL
        }

        public enum ResolutionStatus {
            OPEN,
            UNDER_REVIEW,
            RESOLVED
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DriverLeave extends BaseEntity {
        private Long id;

        @JsonIgnore
        private User user;

        @JsonIgnore
        public User getDriver() {
            return this.user;
        }

        @JsonAlias("leave_type")
        private LeaveType leaveType;

        @JsonAlias("start_date")
        private LocalDate startDate;

        @JsonAlias("end_date")
        private LocalDate endDate;

        private String reason;

        @Builder.Default
        private LeaveStatus status = LeaveStatus.PENDING;

        @JsonAlias("approved_by")
        private String approvedBy;

        @JsonAlias("approval_notes")
        private String approvalNotes;

        public enum LeaveType {
            ANNUAL,
            MEDICAL,
            EMERGENCY,
            UNPAID
        }

        public enum LeaveStatus {
            PENDING,
            APPROVED,
            REJECTED,
            CANCELLED
        }

        @JsonProperty(value = "driver", access = JsonProperty.Access.READ_ONLY)
        public Map<String, String> getDriverSummary() {
            if (user != null) {
                return Map.of(
                    "fullName", user.getFullName() != null ? user.getFullName() : "",
                    "employeeId", user.getEmployeeId() != null ? user.getEmployeeId() : ""
                );
            }
            return null;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DriverPerformanceScore extends BaseEntity {
        private Long id;

        @JsonIgnore
        private User user;

        private Integer periodYear;

        private Integer periodMonth;

        private BigDecimal tripCompletionRate;

        private BigDecimal fuelEfficiencyRatio;

        private BigDecimal infractionDeduction;

        private BigDecimal feedbackScore;

        private BigDecimal compositeScore;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DriverReadinessCache {

        private UUID userId;

        @JsonIgnore
        private User user;

        @Builder.Default
        private Boolean licenseValid = false;

        @Builder.Default
        private Boolean allCertsValid = true;

        @Builder.Default
        private Boolean onLeaveToday = false;

        private String notReadyReason;

        @Builder.Default
        private LocalDateTime lastRefreshed = LocalDateTime.now();

        public boolean isReady() {
            return Boolean.TRUE.equals(licenseValid) && !Boolean.TRUE.equals(onLeaveToday);
        }
    }
}
