package com.claracore.service;

import com.claracore.model.ScriptRequest;
import com.claracore.model.ScriptResponse;
import lombok.extern.slf4j.Slf4j;
import org.codehaus.janino.ScriptEvaluator;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for executing Java scripts using Janino compiler
 */
@Service
@Slf4j
public class ScriptExecutionService {

    /**
     * Execute a Java script with the given context
     */
    public ScriptResponse executeScript(ScriptRequest request) {
        long startTime = System.currentTimeMillis();

        ScriptResponse.ScriptResponseBuilder responseBuilder = ScriptResponse.builder();
        List<String> consoleOutput = new ArrayList<>();
        Map<String, Object> updatedVariables = new HashMap<>(request.getContext());
        List<ScriptResponse.TestResult> testResults = new ArrayList<>();

        try {
            // Create script context with helper objects
            ScriptContext context = new ScriptContext(
                request.getContext(),
                consoleOutput,
                testResults,
                updatedVariables
            );

            // Wrap the user script with our context
            String wrappedScript = wrapScript(request.getScript(), request.getType());

            // Compile and execute using Janino
            ScriptEvaluator evaluator = new ScriptEvaluator();
            evaluator.cook(wrappedScript);

            // Execute with context parameter
            evaluator.evaluate(new Object[] { context });

            responseBuilder
                .success(true)
                .consoleOutput(consoleOutput)
                .updatedVariables(updatedVariables)
                .testResults(testResults);

        } catch (Exception e) {
            log.error("Script execution failed", e);

            String errorMessage = e.getMessage();
            if (e instanceof InvocationTargetException) {
                Throwable cause = ((InvocationTargetException) e).getTargetException();
                errorMessage = cause.getMessage();
            }

            responseBuilder
                .success(false)
                .error("Script execution failed: " + errorMessage)
                .consoleOutput(consoleOutput);
        }

        long executionTime = System.currentTimeMillis() - startTime;
        responseBuilder.executionTime(executionTime);

        return responseBuilder.build();
    }

    /**
     * Wrap user script with ClaraCore API and context
     */
    private String wrapScript(String userScript, String type) {
        StringBuilder wrapped = new StringBuilder();

        wrapped.append("import com.claracore.service.ScriptContext;\n");
        wrapped.append("import java.util.*;\n");
        wrapped.append("import java.util.stream.*;\n");
        wrapped.append("\n");
        wrapped.append("public static void execute(ScriptContext ctx) {\n");
        wrapped.append("    // ClaraCore API objects\n");
        wrapped.append("    var pm = ctx.getPm();\n");
        wrapped.append("    var console = ctx.getConsole();\n");
        wrapped.append("    var test = ctx.getTest();\n");
        wrapped.append("    \n");
        wrapped.append("    // User script begins\n");
        wrapped.append(userScript);
        wrapped.append("\n");
        wrapped.append("    // User script ends\n");
        wrapped.append("}\n");

        return wrapped.toString();
    }

    /**
     * Context object passed to scripts - provides ClaraCore API
     */
    public static class ScriptContext {
        private final Map<String, Object> variables;
        private final List<String> consoleOutput;
        private final List<ScriptResponse.TestResult> testResults;
        private final Map<String, Object> updatedVariables;

        private final PMApi pm;
        private final ConsoleApi console;
        private final TestApi test;

        public ScriptContext(
            Map<String, Object> variables,
            List<String> consoleOutput,
            List<ScriptResponse.TestResult> testResults,
            Map<String, Object> updatedVariables
        ) {
            this.variables = variables;
            this.consoleOutput = consoleOutput;
            this.testResults = testResults;
            this.updatedVariables = updatedVariables;

            this.pm = new PMApi(variables, updatedVariables);
            this.console = new ConsoleApi(consoleOutput);
            this.test = new TestApi(testResults);
        }

        public PMApi getPm() { return pm; }
        public ConsoleApi getConsole() { return console; }
        public TestApi getTest() { return test; }
    }

    /**
     * PM API - similar to Postman's pm object
     */
    public static class PMApi {
        private final Map<String, Object> variables;
        private final Map<String, Object> updatedVariables;
        private final Map<String, Object> environment;
        private final Map<String, Object> globals;

        public PMApi(Map<String, Object> variables, Map<String, Object> updatedVariables) {
            this.variables = variables;
            this.updatedVariables = updatedVariables;
            this.environment = new ConcurrentHashMap<>();
            this.globals = new ConcurrentHashMap<>();

            // Populate from context
            if (variables.containsKey("environment")) {
                Map<String, Object> env = (Map<String, Object>) variables.get("environment");
                this.environment.putAll(env);
            }
        }

        // Environment variables
        public void setEnvironmentVariable(String key, Object value) {
            environment.put(key, value);
            updatedVariables.put("environment." + key, value);
        }

        public Object getEnvironmentVariable(String key) {
            return environment.get(key);
        }

        public void unsetEnvironmentVariable(String key) {
            environment.remove(key);
            updatedVariables.remove("environment." + key);
        }

        // Global variables
        public void setGlobalVariable(String key, Object value) {
            globals.put(key, value);
            updatedVariables.put("global." + key, value);
        }

        public Object getGlobalVariable(String key) {
            return globals.get(key);
        }

        // Request/Response access
        public Map<String, Object> getRequest() {
            return (Map<String, Object>) variables.getOrDefault("request", new HashMap<>());
        }

        public Map<String, Object> getResponse() {
            return (Map<String, Object>) variables.getOrDefault("response", new HashMap<>());
        }

        // Utility methods
        public Map<String, Object> getVariables() {
            return new HashMap<>(variables);
        }
    }

    /**
     * Console API - for logging from scripts
     */
    public static class ConsoleApi {
        private final List<String> output;

        public ConsoleApi(List<String> output) {
            this.output = output;
        }

        public void log(Object... args) {
            output.add("[LOG] " + formatArgs(args));
        }

        public void info(Object... args) {
            output.add("[INFO] " + formatArgs(args));
        }

        public void warn(Object... args) {
            output.add("[WARN] " + formatArgs(args));
        }

        public void error(Object... args) {
            output.add("[ERROR] " + formatArgs(args));
        }

        private String formatArgs(Object... args) {
            if (args == null || args.length == 0) return "";
            return Arrays.stream(args)
                .map(String::valueOf)
                .reduce((a, b) -> a + " " + b)
                .orElse("");
        }
    }

    /**
     * Test API - for assertions in test scripts
     */
    public static class TestApi {
        private final List<ScriptResponse.TestResult> results;

        public TestApi(List<ScriptResponse.TestResult> results) {
            this.results = results;
        }

        public void assertTrue(String name, boolean condition) {
            results.add(ScriptResponse.TestResult.builder()
                .name(name)
                .passed(condition)
                .message(condition ? "Assertion passed" : "Expected true but got false")
                .build());
        }

        public void assertEquals(String name, Object expected, Object actual) {
            boolean passed = Objects.equals(expected, actual);
            results.add(ScriptResponse.TestResult.builder()
                .name(name)
                .passed(passed)
                .message(passed
                    ? "Values are equal"
                    : "Expected: " + expected + ", but got: " + actual)
                .build());
        }

        public void assertNotNull(String name, Object value) {
            boolean passed = value != null;
            results.add(ScriptResponse.TestResult.builder()
                .name(name)
                .passed(passed)
                .message(passed ? "Value is not null" : "Expected non-null value")
                .build());
        }

        public void assertContains(String name, String text, String substring) {
            boolean passed = text != null && text.contains(substring);
            results.add(ScriptResponse.TestResult.builder()
                .name(name)
                .passed(passed)
                .message(passed
                    ? "Text contains substring"
                    : "Text does not contain: " + substring)
                .build());
        }

        public void assertStatusCode(String name, int expected, int actual) {
            boolean passed = expected == actual;
            results.add(ScriptResponse.TestResult.builder()
                .name(name)
                .passed(passed)
                .message(passed
                    ? "Status code matches"
                    : "Expected status: " + expected + ", but got: " + actual)
                .build());
        }
    }
}
