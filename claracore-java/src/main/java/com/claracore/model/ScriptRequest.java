package com.claracore.model;

import lombok.Data;
import java.util.Map;

/**
 * Request model for executing Java scripts
 */
@Data
public class ScriptRequest {
    /**
     * The Java source code to execute
     */
    private String script;

    /**
     * Context variables available to the script
     * (e.g., request, response, environment variables)
     */
    private Map<String, Object> context;

    /**
     * Type of script: "pre-request" or "test"
     */
    private String type;
}
