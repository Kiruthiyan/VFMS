package com.vfms.repository;

import com.vfms.entity.ReportDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportDocumentRepository extends JpaRepository<ReportDocument, Long> {
    List<ReportDocument> findByRemovedFromHistoryAtIsNullOrderByUploadedAtDesc();
}
