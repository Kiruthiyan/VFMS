package com.vfms.dsm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "driver_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverDocument extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private DocumentEntityType entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    public enum DocumentEntityType {
        LICENSE,
        CERTIFICATION,
        PROFILE,
        OTHER
    }
}
