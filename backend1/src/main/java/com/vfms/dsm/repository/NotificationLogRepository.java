package com.vfms.dsm.repository;

import com.vfms.dsm.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByEntityTypeAndEntityIdOrderBySentAtDesc(String entityType, UUID entityId);
}
