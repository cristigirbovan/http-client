package com.claracore.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;
import java.util.List;

/**
 * Response model for script execution results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptResponse {
    /**
     * Whether the script executed successfully
     */
    private boolean success;

    /**
     * Error message if execution failed
     */
    private String error;

    /**
     * Console output from the script
     */
    private List<String> consoleOutput;

    /**
     * Updated environment variables after script execution
     */
    private Map<String, Object> updatedVariables;

    /**
     * Test results (for test scripts)
     */
    private List<TestResult> testResults;

    /**
     * Execution time in milliseconds
     */
    private long executionTime;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestResult {
        private String name;
        private boolean passed;
        private String message;
    }
}
