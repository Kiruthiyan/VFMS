package com.vfms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VfmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(VfmsApplication.class, args);
    }

}
