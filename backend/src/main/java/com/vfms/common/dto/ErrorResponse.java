package com.vfms.common.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorResponse {
    private int status;
    private String message;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
