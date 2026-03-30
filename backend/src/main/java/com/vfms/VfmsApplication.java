package com.vfms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class VfmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(VfmsApplication.class, args);
    }

}
