package com.vfms.dsm;

import com.vfms.dsm.service.DriverServiceRequestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class DriverServiceRequestServiceTest {

    @Autowired
    private DriverServiceRequestService driverServiceRequestService;

    @Test
    void driverServiceRequestServiceBeanLoads() {
        assertNotNull(driverServiceRequestService);
    }

}
