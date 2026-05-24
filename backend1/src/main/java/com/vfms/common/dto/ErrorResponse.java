package com.vfms.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
<<<<<<< HEAD:backend1/src/main/java/com/vfms/common/dto/ErrorResponse.java
=======
import java.util.Map;
>>>>>>> origin/develop:backend/src/main/java/com/vfms/common/dto/ErrorResponse.java

@Data
@Builder
public class ErrorResponse {
<<<<<<< HEAD:backend1/src/main/java/com/vfms/common/dto/ErrorResponse.java
=======
    @Builder.Default
    private boolean success = false;

>>>>>>> origin/develop:backend/src/main/java/com/vfms/common/dto/ErrorResponse.java
    private int status;
    private String message;

    @Builder.Default
<<<<<<< HEAD:backend1/src/main/java/com/vfms/common/dto/ErrorResponse.java
    private LocalDateTime timestamp = LocalDateTime.now();
}
=======
    private Map<String, String> errors = Map.of();

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
>>>>>>> origin/develop:backend/src/main/java/com/vfms/common/dto/ErrorResponse.java
