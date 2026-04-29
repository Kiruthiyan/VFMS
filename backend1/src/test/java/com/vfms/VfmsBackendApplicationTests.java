package com.vfms;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "JWT_SECRET=testsecretkey12345678901234567890",
    "CORS_ALLOWED_ORIGINS=http://localhost:3000",
    "FRONTEND_URL=http://localhost:3000",
    "MAIL_USERNAME=test@test.com",
    "MAIL_PASSWORD=testpassword"
})
class VfmsBackendApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring application context loads successfully
    }
}
