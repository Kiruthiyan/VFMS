package trip_service.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ApprovalDTO {
    private UUID approverId;
    private String notes;
    private UUID assignedVehicleId;
    private UUID assignedDriverId;
}