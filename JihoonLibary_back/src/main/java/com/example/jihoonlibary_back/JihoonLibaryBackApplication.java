package com.example.jihoonlibary_back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class JihoonLibaryBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(JihoonLibaryBackApplication.class, args);
    }

}
