package com.meetmind;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MeetMindApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeetMindApplication.class, args);
        System.out.println("==================================================");
        System.out.println("  MeetMind Spring Boot REST API is now RUNNING!   ");
        System.out.println("  Endpoints available at: http://localhost:8080   ");
        System.out.println("==================================================");
    }
}
