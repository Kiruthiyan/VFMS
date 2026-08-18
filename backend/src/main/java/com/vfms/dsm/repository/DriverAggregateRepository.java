package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverAggregate;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriverAggregateRepository extends JpaRepository<DriverAggregate, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "user")
    @Query("select d from DriverAggregate d where d.id = :id")
    Optional<DriverAggregate> findByIdForUpdate(@Param("id") UUID id);

    @EntityGraph(attributePaths = "user")
    @Query("select d from DriverAggregate d where d.user is not null")
    List<DriverAggregate> findAllCanonical();

    // Fetch a single JSONB column without materializing the entire aggregate
    @Query(value = "select coalesce(documents, '[]'::jsonb)::text from drivers where id = :id", nativeQuery = true)
    Optional<String> findDocumentsJsonById(@Param("id") UUID id);

    // Fetch only the 'leaves' JSONB to avoid deserializing the full aggregate
    @Query(value = "select coalesce(leaves, '[]'::jsonb)::text from drivers where id = :id", nativeQuery = true)
    Optional<String> findLeavesJsonById(@Param("id") UUID id);

    // Fetch only the 'certifications' JSONB to avoid deserializing the full aggregate
    @Query(value = "select coalesce(certifications, '[]'::jsonb)::text from drivers where id = :id", nativeQuery = true)
    Optional<String> findCertificationsJsonById(@Param("id") UUID id);

    // Fetch only the 'licenses' JSONB to avoid deserializing the full aggregate
    @Query(value = "select coalesce(licenses, '[]'::jsonb)::text from drivers where id = :id", nativeQuery = true)
    Optional<String> findLicensesJsonById(@Param("id") UUID id);

    // Fetch only the 'infractions' JSONB to avoid deserializing the full aggregate
    @Query(value = "select coalesce(infractions, '[]'::jsonb)::text from drivers where id = :id", nativeQuery = true)
    Optional<String> findInfractionsJsonById(@Param("id") UUID id);
}
