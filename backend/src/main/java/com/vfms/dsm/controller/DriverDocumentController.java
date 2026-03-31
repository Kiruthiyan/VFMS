package com.vfms.dsm.controller;

import com.vfms.dsm.entity.DriverDocument;
import com.vfms.dsm.service.DriverDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverDocumentController {
    private final DriverDocumentService documentService;

    @PostMapping("/{driverId}/documents")
    public ResponseEntity<DriverDocument> upload(
            @PathVariable UUID driverId,
            @RequestParam("file") MultipartFile file,
            @RequestParam DriverDocument.DocumentEntityType entityType,
            @RequestParam(required = false) Long entityId) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadDocument(driverId, file, entityType, entityId));
    }

    @GetMapping("/{driverId}/documents")
    public ResponseEntity<List<DriverDocument>> getDocuments(@PathVariable UUID driverId) {
        return ResponseEntity.ok(documentService.getDocumentsByDriver(driverId));
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
