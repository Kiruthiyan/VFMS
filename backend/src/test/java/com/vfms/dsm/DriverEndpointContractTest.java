package com.vfms.dsm;

import com.vfms.dsm.controller.DriverController;
import com.vfms.dsm.controller.DriverSelfController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DriverEndpointContractTest {
    @Autowired private RequestMappingHandlerMapping mappings;

    @Test
    void preservesEveryDsmEndpointMethodAndPath() {
        Set<String> actual = new HashSet<>();
        mappings.getHandlerMethods().forEach((info, handler) -> {
            Class<?> type = handler.getBeanType();
            if (type != DriverController.class && type != DriverSelfController.class) return;
            for (RequestMethod method : info.getMethodsCondition().getMethods())
                for (String path : info.getPatternValues()) actual.add(method + " " + path);
        });

        assertThat(actual).containsExactlyInAnyOrderElementsOf(Set.of(
                "GET /api/drivers/from-users", "GET /api/drivers/from-users/{userId:[0-9a-fA-F\\-]{36}}",
                "POST /api/drivers/{driverId}/certifications", "GET /api/drivers/{driverId}/certifications",
                "PUT /api/drivers/certifications/{id}", "DELETE /api/drivers/certifications/{id}",
                "GET /api/drivers/compliance", "POST /api/drivers/{driverId}/documents",
                "GET /api/drivers/{driverId}/documents", "GET /api/drivers/{driverId}/profile-picture",
                "DELETE /api/drivers/documents/{id}", "POST /api/drivers/eligibility",
                "GET /api/drivers/eligibility", "POST /api/internal/drivers/eligibility",
                "GET /api/internal/drivers/eligibility", "GET /api/drivers/infractions",
                "POST /api/drivers/infractions", "GET /api/drivers/{driverId:[0-9a-fA-F\\-]{36}}/infractions",
                "PATCH /api/drivers/infractions/{id}/resolve", "POST /api/drivers/leaves",
                "PATCH /api/drivers/leaves/{leaveId}/process", "GET /api/drivers/{driverId:[0-9a-fA-F\\-]{36}}/leaves",
                "GET /api/drivers/leaves", "GET /api/drivers/leaves/pending",
                "POST /api/drivers/{driverId}/licenses", "GET /api/drivers/{driverId}/licenses",
                "PUT /api/drivers/licenses/{id}", "DELETE /api/drivers/licenses/{id}",
                "GET /api/drivers/{driverId}/performance-scores", "GET /api/drivers/{driverId}/qualification",
                "GET /api/drivers/{driverId}/readiness", "GET /api/drivers/readiness/available",
                "GET /api/drivers/readiness", "POST /api/drivers/{driverId}/readiness/refresh",
                "GET /api/driver/profile", "PUT /api/driver/profile", "POST /api/driver/profile/picture",
                "DELETE /api/driver/profile/picture", "GET /api/driver/licenses", "POST /api/driver/licenses",
                "PUT /api/driver/licenses/{id}", "GET /api/driver/certifications", "POST /api/driver/certifications",
                "GET /api/driver/documents", "POST /api/driver/documents", "DELETE /api/driver/documents/{id}",
                "GET /api/driver/infractions", "GET /api/driver/trips", "GET /api/drivers/leaves/log",
                "GET /api/driver/leave-requests", "POST /api/driver/leave-requests",
                "DELETE /api/driver/leave-requests/{id}"
        ));
    }
}
