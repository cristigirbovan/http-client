package com.claracore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import lombok.extern.slf4j.Slf4j;

/**
 * ClaraCore Java Sidecar Application
 * Provides Java scripting capabilities using Janino compiler
 */
@SpringBootApplication
@Slf4j
public class ClaraCoreApplication {

    public static void main(String[] args) {
        log.info("Starting ClaraCore Java Sidecar...");
        SpringApplication.run(ClaraCoreApplication.class, args);
        log.info("ClaraCore Java Sidecar is ready on port 9090");
    }
}
