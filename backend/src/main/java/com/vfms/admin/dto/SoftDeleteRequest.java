package com.vfms.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SoftDeleteRequest {

    @NotBlank(message = "Deletion reason is required")
    private String reason;
}
