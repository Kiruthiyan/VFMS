package com.vfms.dsm;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DriverControllerMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getAllDriversReturnsOk() throws Exception {
        mockMvc.perform(get("/api/drivers")).andExpect(status().isOk());
    }

}
