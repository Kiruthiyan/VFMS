package com.vfms.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class ErrorResponse {
    @Builder.Default
    private boolean success = false;

    private int status;
    private String message;

    @Builder.Default
    private Map<String, String> errors = Map.of();

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
