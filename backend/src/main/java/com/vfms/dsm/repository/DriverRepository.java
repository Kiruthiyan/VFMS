package com.vfms.dsm.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.dsm.entity.DriverAggregate;
import com.vfms.dsm.entity.DriverAggregate.BaseEntity;
import com.vfms.dsm.entity.DriverAggregate.DriverCertification;
import com.vfms.dsm.entity.DriverAggregate.DriverDocument;
import com.vfms.dsm.entity.DriverAggregate.DriverInfraction;
import com.vfms.dsm.entity.DriverAggregate.DriverLeave;
import com.vfms.dsm.entity.DriverAggregate.DriverLicense;
import com.vfms.dsm.entity.DriverAggregate.DriverPerformanceScore;
import com.vfms.dsm.entity.DriverAggregate.DriverReadinessCache;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Function;

/** Single aggregate-backed DSM persistence facade. */
@Slf4j
@Repository
@RequiredArgsConstructor
@Transactional
public class DriverRepository {
    private final DriverAggregateRepository aggregates;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final UserRepository users;

    @PostConstruct
    void ensureEmbeddedRecordSequence() {
        jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS driver_embedded_record_id_seq START WITH 1");
    }

    public DriverLicense saveLicense(DriverLicense value) {
        User user = Objects.requireNonNull(value.getUser(), "Driver resource requires an owner");
        UUID userId = user.getId();
        LocalDateTime now = LocalDateTime.now();
        ensureDriverRow(user);
        String current = jdbcTemplate.queryForObject(
                "select coalesce(licenses, '[]'::jsonb)::text from drivers where id = ? for update",
                String.class, userId
        );
        List<DriverLicense> items = new ArrayList<>(
                parseList(current, new TypeReference<List<DriverLicense>>() {})
        );
        if (value.getId() == null) {
            value.setId(nextId());
            value.setCreatedAt(now);
            items.add(value);
        } else {
            boolean replaced = false;
            for (int i = 0; i < items.size(); i++) {
                if (value.getId().equals(items.get(i).getId())) {
                    if (value.getCreatedAt() == null) value.setCreatedAt(items.get(i).getCreatedAt());
                    items.set(i, value);
                    replaced = true;
                    break;
                }
            }
            if (!replaced) items.add(value);
        }
        value.setUpdatedAt(now);
        try {
            String json = objectMapper.writeValueAsString(items);
            jdbcTemplate.update(
                    "update drivers set licenses = cast(? as jsonb), updated_at = LOCALTIMESTAMP, version = coalesce(version,0) + 1 where id = ?",
                    json, userId
            );
        } catch (Exception e) {
            throw new InvalidDataAccessApiUsageException("Could not serialize licenses JSON for drivers table", e);
        }
        value.setUser(user);
        return value;
    }
    public Optional<DriverLicense> findLicenseById(Long id) {
        return findAllLicensesColumnScoped().stream().filter(license -> id.equals(license.getId())).findFirst();
    }
    public List<DriverLicense> findLicensesByDriver(UUID id) {
        return aggregates.findLicensesJsonById(id)
                .map(json -> parseList(json, new TypeReference<List<DriverLicense>>() {}))
                .map(list -> {
                    users.findById(id).ifPresent(user -> list.forEach(license -> license.setUser(user)));
                    return list;
                })
                .map(this::byCreated)
                .orElseGet(List::of);
    }
    public List<DriverLicense> findExpiredLicenses(LocalDate date, DriverLicense.LicenseStatus status) {
        return findEvery(DriverAggregate::getLicenses).stream()
                .filter(v -> v.getExpiryDate() != null && v.getExpiryDate().isBefore(date) && v.getStatus() != status).toList();
    }
    public List<DriverLicense> findLicensesExpiringBetween(LocalDate from, LocalDate to) {
        return findEvery(DriverAggregate::getLicenses).stream()
                .filter(v -> v.getExpiryDate() != null && !v.getExpiryDate().isBefore(from)
                        && !v.getExpiryDate().isAfter(to) && v.getStatus() != DriverLicense.LicenseStatus.EXPIRED).toList();
    }
    public void deleteLicense(DriverLicense value) {
        UUID userId = value.getUser() == null ? null : value.getUser().getId();
        if (userId == null) {
            DriverLicense existing = findLicenseById(value.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver license not found: " + value.getId()));
            userId = existing.getUser().getId();
        }
        String current = jdbcTemplate.queryForObject(
                "select coalesce(licenses, '[]'::jsonb)::text from drivers where id = ? for update",
                String.class, userId
        );
        List<DriverLicense> items = new ArrayList<>(
                parseList(current, new TypeReference<List<DriverLicense>>() {})
        );
        items.removeIf(license -> value.getId().equals(license.getId()));
        try {
            String json = objectMapper.writeValueAsString(items);
            jdbcTemplate.update(
                    "update drivers set licenses = cast(? as jsonb), updated_at = LOCALTIMESTAMP, version = coalesce(version,0) + 1 where id = ?",
                    json, userId
            );
        } catch (Exception e) {
            throw new InvalidDataAccessApiUsageException("Could not serialize licenses JSON for drivers table", e);
        }
    }

    public DriverCertification saveCertification(DriverCertification value) {
        return save(value, DriverAggregate::getCertifications, DriverAggregate::setCertifications);
    }
    public Optional<DriverCertification> findCertificationById(Long id) { return findById(id, DriverAggregate::getCertifications); }
    public List<DriverCertification> findCertificationsByDriver(UUID id) {
        // Load only the 'certifications' JSON to avoid deserialization issues in unrelated JSON columns
        return aggregates.findCertificationsJsonById(id)
                .map(json -> parseList(json, new TypeReference<List<DriverCertification>>() {}))
                .map(this::byCreated)
                .orElseGet(List::of);
    }
    public List<DriverCertification> findExpiredCertifications(LocalDate date, DriverCertification.CertStatus status) {
        return findEvery(DriverAggregate::getCertifications).stream()
                .filter(v -> v.getExpiryDate() != null && v.getExpiryDate().isBefore(date) && v.getStatus() != status).toList();
    }
    public List<DriverCertification> findCertificationsExpiringBetween(LocalDate from, LocalDate to) {
        return findEvery(DriverAggregate::getCertifications).stream()
                .filter(v -> v.getExpiryDate() != null && !v.getExpiryDate().isBefore(from)
                        && !v.getExpiryDate().isAfter(to) && v.getStatus() != DriverCertification.CertStatus.EXPIRED).toList();
    }
    public void deleteCertification(Long id) {
        findCertificationById(id).ifPresent(v -> delete(v, DriverAggregate::getCertifications, DriverAggregate::setCertifications));
    }

    public DriverDocument saveDocument(DriverDocument value) {
        // Tolerant, column-scoped writer to avoid deserializing the full aggregate (which may contain
        // legacy/stringified JSON in unrelated columns).
        User user = Objects.requireNonNull(value.getUser(), "Driver resource requires an owner");
        UUID userId = user.getId();
        LocalDateTime now = LocalDateTime.now();

        // Ensure a canonical driver row exists (JSONB columns have defaults at DB level)
        ensureDriverRow(user);

        // Lock row and fetch only documents JSON as text
        String current = jdbcTemplate.queryForObject(
                "select coalesce(documents, '[]'::jsonb)::text from drivers where id = ? for update",
                String.class, userId
        );

        List<DriverDocument> items = new ArrayList<>(
                parseList(current, new TypeReference<List<DriverDocument>>() {})
        );

        if (value.getId() == null) {
            value.setId(nextId());
            value.setCreatedAt(now);
            items.add(value);
        } else {
            boolean replaced = false;
            for (int i = 0; i < items.size(); i++) {
                if (value.getId().equals(items.get(i).getId())) {
                    if (value.getCreatedAt() == null) value.setCreatedAt(items.get(i).getCreatedAt());
                    items.set(i, value);
                    replaced = true;
                    break;
                }
            }
            if (!replaced) items.add(value);
        }

        value.setUpdatedAt(now);

        try {
            String json = objectMapper.writeValueAsString(items);
            jdbcTemplate.update(
                    "update drivers set documents = cast(? as jsonb), updated_at = LOCALTIMESTAMP, version = coalesce(version,0) + 1 where id = ?",
                    json, userId
            );
        } catch (Exception e) {
            throw new InvalidDataAccessApiUsageException("Could not serialize documents JSON for drivers table", e);
        }

        // Ensure association is set on the returned instance (JSON stores no user ref)
        value.setUser(user);
        return value;
    }
    public Optional<DriverDocument> findDocumentById(Long id) {
        return findAllDocumentsColumnScoped().stream()
                .filter(document -> id.equals(document.getId()))
                .findFirst();
    }
    public List<DriverDocument> findDocumentsByDriver(UUID id) {
        // Load only the 'documents' JSON to avoid deserialization issues in unrelated JSON columns
        return aggregates.findDocumentsJsonById(id)
                .map(json -> parseList(json, new TypeReference<List<DriverDocument>>() {}))
                .map(this::byCreated)
                .orElseGet(List::of);
    }
    public List<DriverDocument> findDocumentsByDriverAndType(UUID id, DriverDocument.DocumentEntityType type) {
        // Load only the 'documents' JSON to avoid deserialization issues in unrelated JSON columns
        return aggregates.findDocumentsJsonById(id)
                .map(json -> parseList(json, new TypeReference<List<DriverDocument>>() {}))
                .map(list -> list.stream().filter(v -> v.getEntityType() == type).toList())
                .map(this::byCreated)
                .orElseGet(List::of);
    }
    public void deleteDocument(DriverDocument value) {
        // Column-scoped delete: read only the documents JSONB column, remove the matching item,
        // and write it back — never loads the full DriverAggregate entity via JPA.
        UUID userId = value.getUser() == null ? null : value.getUser().getId();
        if (userId == null) {
            log.warn("deleteDocument called with document {} that has no user — skipping", value.getId());
            return;
        }
        String current = jdbcTemplate.queryForObject(
                "select coalesce(documents, '[]'::jsonb)::text from drivers where id = ? for update",
                String.class, userId
        );
        List<DriverDocument> items = new ArrayList<>(
                parseList(current, new TypeReference<List<DriverDocument>>() {})
        );
        items.removeIf(d -> value.getId().equals(d.getId()));
        try {
            String json = objectMapper.writeValueAsString(items);
            jdbcTemplate.update(
                    "update drivers set documents = cast(? as jsonb), updated_at = LOCALTIMESTAMP, " +
                            "version = coalesce(version,0) + 1 where id = ?",
                    json, userId
            );
        } catch (Exception e) {
            throw new InvalidDataAccessApiUsageException("Could not serialize documents JSON for drivers table", e);
        }
    }

    public DriverInfraction saveInfraction(DriverInfraction value) {
        User user = Objects.requireNonNull(value.getUser(), "Driver resource requires an owner");
        UUID userId = user.getId();
        LocalDateTime now = LocalDateTime.now();

        ensureDriverRow(user);

        String current = jdbcTemplate.queryForObject(
                "select coalesce(infractions, '[]'::jsonb)::text from drivers where id = ? for update",
                String.class, userId
        );
        List<DriverInfraction> items = new ArrayList<>(
                parseList(current, new TypeReference<List<DriverInfraction>>() {})
        );

        if (value.getId() == null) {
            value.setId(nextId());
            value.setCreatedAt(now);
            items.add(value);
        } else {
            boolean replaced = false;
            for (int i = 0; i < items.size(); i++) {
                if (value.getId().equals(items.get(i).getId())) {
                    if (value.getCreatedAt() == null) value.setCreatedAt(items.get(i).getCreatedAt());
                    items.set(i, value);
                    replaced = true;
                    break;
                }
            }
            if (!replaced) items.add(value);
        }

        value.setUpdatedAt(now);
        try {
            String json = objectMapper.writeValueAsString(items);
            jdbcTemplate.update(
                    "update drivers set infractions = cast(? as jsonb), updated_at = LOCALTIMESTAMP, " +
                            "version = coalesce(version,0) + 1 where id = ?",
                    json, userId
            );
        } catch (Exception e) {
            throw new InvalidDataAccessApiUsageException("Could not serialize infractions JSON for drivers table", e);
        }

        value.setUser(user);
        return value;
    }
    public Optional<DriverInfraction> findInfractionById(Long id) {
        return findAllInfractionsColumnScoped().stream()
                .filter(infraction -> id.equals(infraction.getId()))
                .findFirst();
    }
    public List<DriverInfraction> findAllInfractions() { return byCreated(findAllInfractionsColumnScoped()); }
    public List<DriverInfraction> findInfractionsByDriver(UUID id) {
        // Load only the 'infractions' JSON to avoid deserialization issues in unrelated JSON columns
        List<DriverInfraction> infractions = aggregates.findInfractionsJsonById(id)
                .map(json -> parseList(json, new TypeReference<List<DriverInfraction>>() {}))
                .orElseGet(List::of);
        users.findById(id).ifPresent(user -> infractions.forEach(infraction -> infraction.setUser(user)));
        return byCreated(infractions);
    }
    public long countUnresolvedInfractions(UUID id, DriverInfraction.Severity severity, DriverInfraction.ResolutionStatus excluded) {
        return findInfractionsByDriver(id).stream()
                .filter(v -> v.getSeverity() == severity && v.getResolutionStatus() != excluded).count();
    }

    public DriverLeave saveLeave(DriverLeave value) {
        User user = Objects.requireNonNull(value.getUser(), "Driver resource requires an owner");
        UUID userId = user.getId();
        LocalDateTime now = LocalDateTime.now();
        ensureDriverRow(user);

        List<DriverLeave> items = new ArrayList<>(readLeavesForUpdate(userId));
        if (value.getId() == null) {
            value.setId(nextId());
            value.setCreatedAt(now);
            items.add(value);
        } else {
            boolean replaced = false;
            for (int i = 0; i < items.size(); i++) {
                if (value.getId().equals(items.get(i).getId())) {
                    if (value.getCreatedAt() == null) value.setCreatedAt(items.get(i).getCreatedAt());
                    items.set(i, value);
                    replaced = true;
                    break;
                }
            }
            if (!replaced) items.add(value);
        }
        value.setUpdatedAt(now);
        writeLeaves(userId, items);
        value.setUser(user);
        return value;
    }
    public Optional<DriverLeave> findLeaveById(Long id) {
        return findAllLeavesColumnScoped().stream().filter(leave -> id.equals(leave.getId())).findFirst();
    }
    public List<DriverLeave> findAllLeaves() { return byCreated(findAllLeavesColumnScoped()); }
    public List<DriverLeave> findLeavesByDriver(UUID id) {
        // Load only the 'leaves' JSON to avoid deserialization issues in unrelated JSON columns
        List<DriverLeave> leaves = aggregates.findLeavesJsonById(id)
                .map(json -> parseList(json, new TypeReference<List<DriverLeave>>() {}))
                .orElseGet(List::of);
        users.findById(id).ifPresent(user -> leaves.forEach(leave -> leave.setUser(user)));
        return byCreated(leaves);
    }
    public List<DriverLeave> findLeavesByStatus(DriverLeave.LeaveStatus status) {
        return byCreated(findAllLeavesColumnScoped().stream().filter(v -> v.getStatus() == status).toList());
    }
    public long countOverlappingLeaves(UUID id, LocalDate start, LocalDate end, List<DriverLeave.LeaveStatus> excluded) {
        return findLeavesByDriver(id).stream()
                .filter(v -> !excluded.contains(v.getStatus()))
                .filter(v -> !v.getStartDate().isAfter(end) && !v.getEndDate().isBefore(start)).count();
    }
    public boolean hasApprovedLeaveOnDate(UUID id, LocalDate date) {
        // Avoid loading full aggregate; check only within the 'leaves' JSON column
        return aggregates.findLeavesJsonById(id)
                .map(json -> parseList(json, new TypeReference<List<DriverLeave>>() {}))
                .orElseGet(List::of)
                .stream()
                .anyMatch(v -> v.getStatus() == DriverLeave.LeaveStatus.APPROVED
                        && !v.getStartDate().isAfter(date) && !v.getEndDate().isBefore(date));
    }
    public void deleteLeave(DriverLeave value) {
        User user = Objects.requireNonNull(value.getUser(), "Driver leave requires an owner");
        List<DriverLeave> items = new ArrayList<>(readLeavesForUpdate(user.getId()));
        items.removeIf(item -> value.getId().equals(item.getId()));
        writeLeaves(user.getId(), items);
    }

    public DriverPerformanceScore savePerformanceScore(DriverPerformanceScore value) {
        return save(value, DriverAggregate::getPerformanceScores, DriverAggregate::setPerformanceScores);
    }
    public List<DriverPerformanceScore> findPerformanceScoresByDriver(UUID id) {
        return findByDriver(id, DriverAggregate::getPerformanceScores).stream()
                .sorted(Comparator.comparing(DriverPerformanceScore::getPeriodYear, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(DriverPerformanceScore::getPeriodMonth, Comparator.nullsLast(Comparator.reverseOrder()))).toList();
    }
    public Optional<DriverPerformanceScore> findPerformanceScore(UUID id, int year, int month) {
        return findByDriver(id, DriverAggregate::getPerformanceScores).stream()
                .filter(v -> Integer.valueOf(year).equals(v.getPeriodYear()) && Integer.valueOf(month).equals(v.getPeriodMonth())).findFirst();
    }

    @Transactional(readOnly = true)
    public Optional<DriverReadinessCache> findReadiness(UUID id) {
        // Column-scoped, JSON-safe read: do not materialize the full aggregate to avoid
        // deserialization of legacy/stringified JSON columns.
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(
                    "select id, readiness_license_valid, readiness_all_certs_valid, " +
                            "readiness_on_leave_today, readiness_not_ready_reason, readiness_last_refreshed " +
                            "from drivers where id = ?",
                    (rs, rowNum) -> DriverReadinessCache.builder()
                            .userId((UUID) rs.getObject("id"))
                            .licenseValid(rs.getObject("readiness_license_valid") != null && rs.getBoolean("readiness_license_valid"))
                            .allCertsValid(rs.getObject("readiness_all_certs_valid") != null && rs.getBoolean("readiness_all_certs_valid"))
                            .onLeaveToday(rs.getObject("readiness_on_leave_today") != null && rs.getBoolean("readiness_on_leave_today"))
                            .notReadyReason(rs.getString("readiness_not_ready_reason"))
                            .lastRefreshed(rs.getTimestamp("readiness_last_refreshed") == null ? null :
                                    rs.getTimestamp("readiness_last_refreshed").toLocalDateTime())
                            .build(),
                    id
            ));
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    @Transactional(readOnly = true)
    public List<DriverReadinessCache> findAllReadiness() {
        // Prefer JSON-safe read that does not touch JSONB columns.
        return jdbcTemplate.query(
                "select id, readiness_license_valid, readiness_all_certs_valid, " +
                        "readiness_on_leave_today, readiness_not_ready_reason, readiness_last_refreshed " +
                        "from drivers",
                (rs, rowNum) -> DriverReadinessCache.builder()
                        .userId((UUID) rs.getObject("id"))
                        .licenseValid(rs.getObject("readiness_license_valid") != null && rs.getBoolean("readiness_license_valid"))
                        .allCertsValid(rs.getObject("readiness_all_certs_valid") != null && rs.getBoolean("readiness_all_certs_valid"))
                        .onLeaveToday(rs.getObject("readiness_on_leave_today") != null && rs.getBoolean("readiness_on_leave_today"))
                        .notReadyReason(rs.getString("readiness_not_ready_reason"))
                        .lastRefreshed(rs.getTimestamp("readiness_last_refreshed") == null ? null :
                                rs.getTimestamp("readiness_last_refreshed").toLocalDateTime())
                        .build()
        ).stream().sorted(Comparator.comparing(DriverReadinessCache::getLastRefreshed,
                Comparator.nullsLast(Comparator.reverseOrder()))).toList();
    }
    @Transactional
    public DriverReadinessCache saveReadiness(DriverReadinessCache cache) {
        // Column-scoped, JSON-safe write to avoid loading full aggregate
        if (cache.getUser() != null) {
            ensureDriverRow(cache.getUser());
        } else {
            Integer count = jdbcTemplate.queryForObject(
                    "select count(*) from drivers where id = ?", Integer.class, cache.getUserId());
            if (count == null || count == 0) {
                throw new ResourceNotFoundException("Driver not found: " + cache.getUserId());
            }
        }

        jdbcTemplate.update(
                "update drivers set readiness_license_valid = ?, readiness_all_certs_valid = ?, " +
                        "readiness_on_leave_today = ?, readiness_not_ready_reason = ?, readiness_last_refreshed = ?, " +
                        "updated_at = LOCALTIMESTAMP, version = coalesce(version,0) + 1 where id = ?",
                cache.getLicenseValid(), cache.getAllCertsValid(), cache.getOnLeaveToday(), cache.getNotReadyReason(),
                cache.getLastRefreshed(), cache.getUserId()
        );

        return cache;
    }

    @Transactional
    protected <T extends BaseEntity> T save(T resource, Function<DriverAggregate, List<T>> getter,
                                             BiConsumer<DriverAggregate, List<T>> setter) {
        User user = Objects.requireNonNull(resource.getUser(), "Driver resource requires an owner");
        DriverAggregate aggregate = aggregates.findByIdForUpdate(user.getId()).orElseGet(() -> aggregates.saveAndFlush(newAggregate(user)));
        List<T> items = new ArrayList<>(Optional.ofNullable(getter.apply(aggregate)).orElseGet(List::of));
        LocalDateTime now = LocalDateTime.now();
        if (resource.getId() == null) {
            resource.setId(nextId()); resource.setCreatedAt(now); items.add(resource);
        } else {
            boolean replaced = false;
            for (int i = 0; i < items.size(); i++) if (resource.getId().equals(items.get(i).getId())) {
                if (resource.getCreatedAt() == null) resource.setCreatedAt(items.get(i).getCreatedAt());
                items.set(i, resource); replaced = true; break;
            }
            if (!replaced) items.add(resource);
        }
        resource.setUpdatedAt(now); setter.accept(aggregate, items); aggregate.setUpdatedAt(now);
        aggregates.saveAndFlush(aggregate); resource.setUser(user); return resource;
    }

    @Transactional(readOnly = true)
    protected <T extends BaseEntity> Optional<T> findById(Long id, Function<DriverAggregate, List<T>> getter) {
        return aggregates.findAllCanonical().stream().map(a -> ownedItem(a, id, getter)).flatMap(Optional::stream).findFirst();
    }
    @Transactional(readOnly = true)
    protected <T extends BaseEntity> List<T> findByDriver(UUID id, Function<DriverAggregate, List<T>> getter) {
        return aggregates.findById(id).map(a -> attachAll(a, getter.apply(a))).orElseGet(List::of);
    }
    @Transactional(readOnly = true)
    protected <T extends BaseEntity> List<T> findEvery(Function<DriverAggregate, List<T>> getter) {
        return aggregates.findAllCanonical().stream().flatMap(a -> attachAll(a, getter.apply(a)).stream()).toList();
    }
    @Transactional
    protected <T extends BaseEntity> void delete(T resource, Function<DriverAggregate, List<T>> getter,
                                                  BiConsumer<DriverAggregate, List<T>> setter) {
        UUID id = resource.getUser() == null ? null : resource.getUser().getId();
        if (id == null) id = aggregates.findAllCanonical().stream()
                .filter(a -> getter.apply(a).stream().anyMatch(i -> resource.getId().equals(i.getId())))
                .map(DriverAggregate::getId).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Driver resource not found: " + resource.getId()));
        UUID resolvedId = id;
        DriverAggregate aggregate = aggregates.findByIdForUpdate(resolvedId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + resolvedId));
        List<T> items = new ArrayList<>(Optional.ofNullable(getter.apply(aggregate)).orElseGet(List::of));
        items.removeIf(i -> resource.getId().equals(i.getId())); setter.accept(aggregate, items);
        aggregate.setUpdatedAt(LocalDateTime.now()); aggregates.saveAndFlush(aggregate);
    }

    private DriverAggregate newAggregate(User user) {
        return DriverAggregate.builder().id(user.getId()).user(user).employeeId(user.getEmployeeId())
                .fullName(user.getFullName()).status(user.getStatus() == null ? "ACTIVE" : user.getStatus().name()).build();
    }
    private long nextId() {
        Number value = jdbcTemplate.queryForObject("SELECT nextval('driver_embedded_record_id_seq')", Number.class);
        if (value == null) throw new IllegalStateException("Could not allocate driver resource ID");
        return value.longValue();
    }

    private void ensureDriverRow(User user) {
        Integer count = jdbcTemplate.queryForObject("select count(*) from drivers where id = ?", Integer.class, user.getId());
        if (count == null || count == 0) {
            aggregates.saveAndFlush(newAggregate(user));
        }
    }

    private List<DriverLeave> readLeavesForUpdate(UUID userId) {
        String current = jdbcTemplate.queryForObject(
                "select coalesce(leaves, '[]'::jsonb)::text from drivers where id = ? for update",
                String.class, userId
        );
        return parseList(current, new TypeReference<List<DriverLeave>>() {});
    }

    private void writeLeaves(UUID userId, List<DriverLeave> items) {
        try {
            String json = objectMapper.writeValueAsString(items);
            jdbcTemplate.update(
                    "update drivers set leaves = cast(? as jsonb), updated_at = LOCALTIMESTAMP, " +
                            "version = coalesce(version,0) + 1 where id = ?",
                    json, userId
            );
        } catch (Exception e) {
            throw new InvalidDataAccessApiUsageException("Could not serialize leaves JSON for drivers table", e);
        }
    }

    private List<DriverLeave> findAllLeavesColumnScoped() {
        return jdbcTemplate.query(
                        "select id, coalesce(leaves, '[]'::jsonb)::text as leaves_json from drivers",
                        (rs, rowNum) -> Map.entry((UUID) rs.getObject("id"), rs.getString("leaves_json")))
                .stream()
                .flatMap(entry -> {
                    List<DriverLeave> leaves = parseList(
                            entry.getValue(), new TypeReference<List<DriverLeave>>() {});
                    users.findById(entry.getKey()).ifPresent(user -> leaves.forEach(leave -> leave.setUser(user)));
                    return leaves.stream();
                })
                .toList();
    }

    private List<DriverInfraction> findAllInfractionsColumnScoped() {
        return jdbcTemplate.query(
                        "select id, coalesce(infractions, '[]'::jsonb)::text as infractions_json from drivers",
                        (rs, rowNum) -> Map.entry((UUID) rs.getObject("id"), rs.getString("infractions_json")))
                .stream()
                .flatMap(entry -> {
                    List<DriverInfraction> infractions = parseList(
                            entry.getValue(), new TypeReference<List<DriverInfraction>>() {});
                    users.findById(entry.getKey()).ifPresent(user ->
                            infractions.forEach(infraction -> infraction.setUser(user)));
                    return infractions.stream();
                })
                .toList();
    }
    private List<DriverDocument> findAllDocumentsColumnScoped() {
        return jdbcTemplate.query(
                        "select id, coalesce(documents, '[]'::jsonb)::text as documents_json from drivers",
                        (rs, rowNum) -> Map.entry((UUID) rs.getObject("id"), rs.getString("documents_json")))
                .stream()
                .flatMap(entry -> {
                    List<DriverDocument> documents = parseList(
                            entry.getValue(), new TypeReference<List<DriverDocument>>() {});
                    users.findById(entry.getKey()).ifPresent(user ->
                            documents.forEach(document -> document.setUser(user)));
                    return documents.stream();
                })
                .toList();
    }
    private List<DriverLicense> findAllLicensesColumnScoped() {
        return jdbcTemplate.query(
                        "select id, coalesce(licenses, '[]'::jsonb)::text as licenses_json from drivers",
                        (rs, rowNum) -> Map.entry((UUID) rs.getObject("id"), rs.getString("licenses_json")))
                .stream()
                .flatMap(entry -> {
                    List<DriverLicense> licenses = parseList(
                            entry.getValue(), new TypeReference<List<DriverLicense>>() {});
                    users.findById(entry.getKey()).ifPresent(user ->
                            licenses.forEach(license -> license.setUser(user)));
                    return licenses.stream();
                })
                .toList();
    }
    private <T extends BaseEntity> Optional<T> ownedItem(DriverAggregate a, Long id, Function<DriverAggregate, List<T>> getter) {
        return Optional.ofNullable(getter.apply(a)).orElseGet(List::of).stream()
                .filter(v -> id.equals(v.getId())).peek(v -> v.setUser(a.getUser())).findFirst();
    }
    private <T extends BaseEntity> List<T> attachAll(DriverAggregate a, List<T> values) {
        if (values == null) return List.of(); values.forEach(v -> v.setUser(a.getUser())); return new ArrayList<>(values);
    }
    private <T extends BaseEntity> List<T> byCreated(List<T> values) {
        return values.stream().sorted(Comparator.comparing(BaseEntity::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder()))).toList();
    }
    private DriverReadinessCache toReadiness(DriverAggregate a) {
        return DriverReadinessCache.builder().userId(a.getId()).user(a.getUser())
                .licenseValid(a.getReadinessLicenseValid()).allCertsValid(a.getReadinessAllCertsValid())
                .onLeaveToday(a.getReadinessOnLeaveToday()).notReadyReason(a.getReadinessNotReadyReason())
                .lastRefreshed(a.getReadinessLastRefreshed()).build();
    }

    private <T> List<T> parseList(String json, TypeReference<List<T>> type) {
        if (json == null || json.isBlank() || "null".equalsIgnoreCase(json)) return List.of();
        try {
            JsonNode root = objectMapper.readTree(json);

            // Handle single-encoded string: the DB column contains a JSON-encoded string
            // whose value is the real JSON array (e.g. "\"[{...}]\"").
            if (root.isTextual()) {
                String inner = root.asText();
                if (inner == null || inner.isBlank() || "null".equalsIgnoreCase(inner)) return List.of();

                // Guard against triple-encoded data: parse inner again and check.
                JsonNode innerNode = objectMapper.readTree(inner);
                if (innerNode.isTextual()) {
                    // Triple-encoded — unwrap one more level.
                    String innerInner = innerNode.asText();
                    if (innerInner == null || innerInner.isBlank() || "null".equalsIgnoreCase(innerInner)) return List.of();
                    return objectMapper.readValue(innerInner, type);
                }
                if (innerNode.isArray()) {
                    return objectMapper.readValue(inner, type);
                }
                return List.of();
            }

            if (root.isArray()) {
                return objectMapper.readValue(json, type);
            }

            return List.of();
        } catch (Exception e) {
            // Log the corrupt column data as a warning and return an empty list so that
            // callers (e.g. profile picture upload) are not blocked by legacy/incompatible
            // data that was stored in a different schema revision.
            log.warn("parseList: could not deserialize JSON column, returning empty list. Error: {}", e.getMessage());
            return List.of();
        }
    }
}
