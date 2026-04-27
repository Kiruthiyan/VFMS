package trip_service.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ApprovalDTO {
    private UUID approverId;
    private String notes;
    private Long assignedVehicleId;
    private UUID assignedDriverId;
}