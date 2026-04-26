package com.vfms;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration smoke test that verifies the Spring application context loads
 * without errors.  If any bean configuration, dependency injection, or
 * property binding is broken this test will fail, giving early feedback.
 */
@SpringBootTest
class VfmsBackendApplicationTests {

	@Autowired
	private ApplicationContext applicationContext;

	@Test
	void contextLoads() {
		// Verify that the Spring context starts and is non-null
		assertThat(applicationContext).isNotNull();
	}

}
