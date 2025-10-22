# ClaraCore Java Sidecar

Java scripting engine for ClaraCore using Janino compiler. This sidecar process allows users to write pre-request and test scripts in **Java** instead of JavaScript.

## Architecture

```
┌─────────────────────────────────────┐
│   Electron App (port 5173)          │
│   - React UI                        │
│   - HTTP Client                     │
└──────────────┬──────────────────────┘
               │ REST API
               ▼
┌─────────────────────────────────────┐
│   Java Sidecar (port 9090)          │
│   - Spring Boot REST API            │
│   - Janino Compiler                 │
│   - Script Execution Engine         │
└─────────────────────────────────────┘
```

## Features

### Script Execution
- **Pre-request scripts**: Modify request before sending (set variables, headers, etc.)
- **Test scripts**: Assert response data, extract values, run tests
- **Java syntax**: Full Java language support via Janino
- **Runtime compilation**: Scripts compiled and executed on-the-fly

### ClaraCore API (pm object)

Scripts have access to a `pm` object similar to Postman:

```java
// Environment variables
pm.setEnvironmentVariable("token", "abc123");
String token = (String) pm.getEnvironmentVariable("token");

// Global variables
pm.setGlobalVariable("userId", 42);

// Request/Response access
Map<String, Object> request = pm.getRequest();
Map<String, Object> response = pm.getResponse();
```

### Console API

```java
console.log("Hello from Java script!");
console.info("Request URL:", request.get("url"));
console.warn("Warning message");
console.error("Error occurred");
```

### Test API (assertions)

```java
// Status code
test.assertStatusCode("Status is 200", 200, response.get("status"));

// Equality
test.assertEquals("User ID matches", 123, userId);

// Null checks
test.assertNotNull("Response body exists", response.get("body"));

// String contains
test.assertContains("Body contains 'success'", responseBody, "success");

// Boolean assertions
test.assertTrue("Is authenticated", isAuth);
```

## Example Scripts

### Pre-request Script

```java
// Set authorization token from environment
String token = (String) pm.getEnvironmentVariable("authToken");
pm.getRequest().put("headers", Map.of("Authorization", "Bearer " + token));

// Log request details
console.log("Sending request to:", pm.getRequest().get("url"));

// Generate timestamp
long timestamp = System.currentTimeMillis();
pm.setEnvironmentVariable("requestTime", timestamp);
```

### Test Script

```java
// Get response
Map<String, Object> response = pm.getResponse();
int statusCode = (int) response.get("statusCode");
String body = (String) response.get("body");

// Run assertions
test.assertStatusCode("Status is 200", 200, statusCode);
test.assertNotNull("Body is not null", body);
test.assertContains("Body contains user", body, "user");

// Extract data and save to environment
// Parse JSON (you can use Jackson or simple parsing)
if (body.contains("\"token\":")) {
    String token = extractToken(body);
    pm.setEnvironmentVariable("authToken", token);
    console.log("Saved auth token:", token);
}

// Helper method
String extractToken(String json) {
    // Simple extraction (in real code, use proper JSON parser)
    int start = json.indexOf("\"token\":\"") + 9;
    int end = json.indexOf("\"", start);
    return json.substring(start, end);
}
```

## API Endpoints

### Execute Pre-request Script
```
POST /api/scripts/pre-request
Content-Type: application/json

{
  "script": "console.log('Hello');",
  "context": {
    "request": { "url": "https://api.example.com", "method": "GET" },
    "environment": { "baseUrl": "https://api.example.com" }
  }
}
```

### Execute Test Script
```
POST /api/scripts/test
Content-Type: application/json

{
  "script": "test.assertEquals('Test', 200, response.get('statusCode'));",
  "context": {
    "response": { "statusCode": 200, "body": "{\"status\":\"ok\"}" },
    "environment": { "baseUrl": "https://api.example.com" }
  }
}
```

### Response Format
```json
{
  "success": true,
  "error": null,
  "consoleOutput": [
    "[LOG] Hello",
    "[INFO] Request URL: https://api.example.com"
  ],
  "updatedVariables": {
    "environment.authToken": "abc123",
    "global.userId": 42
  },
  "testResults": [
    {
      "name": "Status is 200",
      "passed": true,
      "message": "Status code matches"
    }
  ],
  "executionTime": 45
}
```

## Build & Run

### Prerequisites
- Java 17+
- Maven 3.8+

### Build
```bash
cd claracore-java
mvn clean package
```

### Run
```bash
java -jar target/claracore-java-sidecar-1.0.0.jar
```

The server will start on **port 9090**.

### Development Mode
```bash
mvn spring-boot:run
```

## Integration with Electron

The Electron app will automatically start this Java process on port 9090 and communicate via REST API.

See the main ClaraCore README for full integration details.
