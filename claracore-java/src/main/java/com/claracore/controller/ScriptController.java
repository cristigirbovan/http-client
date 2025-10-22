package com.claracore.controller;

import com.claracore.model.ScriptRequest;
import com.claracore.model.ScriptResponse;
import com.claracore.service.ScriptExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API for executing Java scripts
 */
@RestController
@RequestMapping("/api/scripts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Allow Electron app to call this API
public class ScriptController {

    private final ScriptExecutionService scriptExecutionService;

    /**
     * Execute a pre-request script
     */
    @PostMapping("/pre-request")
    public ResponseEntity<ScriptResponse> executePreRequestScript(@RequestBody ScriptRequest request) {
        log.info("Executing pre-request script");
        request.setType("pre-request");
        ScriptResponse response = scriptExecutionService.executeScript(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Execute a test script
     */
    @PostMapping("/test")
    public ResponseEntity<ScriptResponse> executeTestScript(@RequestBody ScriptRequest request) {
        log.info("Executing test script");
        request.setType("test");
        ScriptResponse response = scriptExecutionService.executeScript(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Execute any script (generic endpoint)
     */
    @PostMapping("/execute")
    public ResponseEntity<ScriptResponse> executeScript(@RequestBody ScriptRequest request) {
        log.info("Executing script of type: {}", request.getType());
        ScriptResponse response = scriptExecutionService.executeScript(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ClaraCore Java Sidecar is running");
    }
}
