package com.vfms.repository;

import com.vfms.entity.ReportDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportDocumentRepository extends JpaRepository<ReportDocument, Long> {
}
