package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DriverDocumentRepository extends JpaRepository<DriverDocument, Long> {
    List<DriverDocument> findByUserIdOrderByCreatedAtDesc(UUID driverId);

    List<DriverDocument> findByUserIdAndEntityTypeOrderByCreatedAtDesc(UUID driverId, DriverDocument.DocumentEntityType entityType);
}
