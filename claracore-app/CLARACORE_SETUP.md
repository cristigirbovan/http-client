# ClaraCore Setup & Usage Guide

## What is ClaraCore?

**ClaraCore** is a full-featured HTTP client application (like Postman) designed specifically for **Java/Spring Boot developers**. The key difference? You write scripts in **Java** instead of JavaScript!

### Key Features

✅ **Full HTTP Client** - All HTTP methods, headers, auth, body types
✅ **Java Scripting** - Pre-request and test scripts in Java using Janino compiler
✅ **Java Code Generators** - Generate RestTemplate, WebClient, Feign, OkHttp, JUnit code
✅ **POJO Generator** - Auto-generate Java classes from JSON responses
✅ **Local Storage Only** - Everything stored locally, no cloud/server
✅ **Collections & Environments** - Organize requests and manage variables

## Architecture

```
┌─────────────────────────────────────────┐
│   Electron App (React + TypeScript)     │
│   - HTTP Client UI                      │
│   - Monaco Editor for Java scripts      │
│   - Collections, History, Environments  │
└──────────────┬──────────────────────────┘
               │ REST API (localhost:9090)
               ▼
┌─────────────────────────────────────────┐
│   Java Sidecar (Spring Boot + Janino)   │
│   - Compiles & executes Java scripts    │
│   - Provides pm, console, test APIs     │
│   - Pre-request & test script execution │
└─────────────────────────────────────────┘
```

## Quick Start

### Step 1: Build Java Sidecar

```bash
cd ../claracore-java
mvn clean package
```

**Result:** `target/claracore-java-sidecar-1.0.0.jar` is created

### Step 2: Install Dependencies

```bash
cd ../claracore-app
npm install
```

### Step 3: Run

**Terminal 1 - Java Sidecar:**
```bash
cd ../claracore-java
java -jar target/claracore-java-sidecar-1.0.0.jar
```

Wait for: `✅ ClaraCore Java Sidecar is ready on port 9090`

**Terminal 2 - Electron App:**
```bash
cd ../claracore-app
npm run dev
```

The app will launch automatically! 🚀

## Using Java Scripts

### Pre-request Scripts

**Purpose:** Run Java code BEFORE sending the request (set variables, headers, etc.)

**Example:**
```java
// Generate auth token
String token = "Bearer " + java.util.UUID.randomUUID().toString();
pm.setEnvironmentVariable("authToken", token);

// Add timestamp
pm.setEnvironmentVariable("timestamp", System.currentTimeMillis());

// Log info
console.log("Generated token:", token);
```

### Test Scripts

**Purpose:** Run Java code AFTER receiving the response (validate, extract data, run tests)

**Example:**
```java
// Get response
Map<String, Object> response = pm.getResponse();
int statusCode = (int) response.get("statusCode");
String body = (String) response.get("body");

// Run tests
test.assertStatusCode("Status is 200", 200, statusCode);
test.assertNotNull("Body exists", body);
test.assertContains("Contains success", body, "success");

// Extract token from response
if (body.contains("\"token\":\"")) {
    int start = body.indexOf("\"token\":\"") + 9;
    int end = body.indexOf("\"", start);
    String token = body.substring(start, end);

    pm.setEnvironmentVariable("token", token);
    console.log("Token saved:", token);
}
```

## ClaraCore API Reference

### PM Object (Postman-like API)

```java
// Environment variables
pm.setEnvironmentVariable(String key, Object value)
Object pm.getEnvironmentVariable(String key)
pm.unsetEnvironmentVariable(String key)

// Global variables (persist across all environments)
pm.setGlobalVariable(String key, Object value)
Object pm.getGlobalVariable(String key)

// Request access
Map<String, Object> request = pm.getRequest()
// Contains: url, method, headers, body

// Response access
Map<String, Object> response = pm.getResponse()
// Contains: statusCode, headers, body, responseTime, responseSize
```

### Console Object

```java
console.log("Message", variable)     // General logging
console.info("Info message")         // Info level
console.warn("Warning message")      // Warning level
console.error("Error occurred")      // Error level
```

### Test Object

```java
// Assert status code
test.assertStatusCode("Test name", expectedCode, actualCode)

// Assert equality
test.assertEquals("Test name", expected, actual)

// Assert not null
test.assertNotNull("Test name", value)

// Assert contains substring
test.assertContains("Test name", text, substring)

// Assert boolean condition
test.assertTrue("Test name", condition)
```

## Example Workflows

### 1. Simple GET Request with Test

**Request:**
- URL: `https://jsonplaceholder.typicode.com/posts/1`
- Method: `GET`

**Test Script:**
```java
Map<String, Object> response = pm.getResponse();
int statusCode = (int) response.get("statusCode");
String body = (String) response.get("body");

test.assertStatusCode("Status is 200", 200, statusCode);
test.assertContains("Has userId", body, "userId");
test.assertContains("Has title", body, "title");

console.log("Test passed! Post retrieved successfully");
```

### 2. Authentication Flow

**Request 1 - Login:**
- URL: `{{baseUrl}}/auth/login`
- Method: `POST`
- Body: `{"username": "user", "password": "pass"}`

**Test Script:**
```java
Map<String, Object> response = pm.getResponse();
String body = (String) response.get("body");

// Extract token (simple string parsing - use JSON library in production)
if (body.contains("\"access_token\":\"")) {
    int start = body.indexOf("\"access_token\":\"") + 16;
    int end = body.indexOf("\"", start);
    String token = body.substring(start, end);

    // Save for next request
    pm.setEnvironmentVariable("authToken", token);

    test.assertNotNull("Token received", token);
    console.log("Token saved successfully");
}
```

**Request 2 - Get Protected Resource:**
- URL: `{{baseUrl}}/api/user/profile`
- Method: `GET`
- Headers: `Authorization: Bearer {{authToken}}`

**Pre-request Script:**
```java
String token = (String) pm.getEnvironmentVariable("authToken");
if (token == null) {
    console.error("No auth token found! Please login first.");
}
console.log("Using token:", token);
```

### 3. Data Extraction & Chaining

**Request 1 - Create User:**

**Test Script:**
```java
Map<String, Object> response = pm.getResponse();
String body = (String) response.get("body");

// Extract user ID from response
if (body.contains("\"id\":")) {
    int start = body.indexOf("\"id\":") + 5;
    int end = body.indexOf(",", start);
    String userId = body.substring(start, end).trim();

    pm.setEnvironmentVariable("createdUserId", userId);
    console.log("User created with ID:", userId);
}
```

**Request 2 - Get User:**
- URL: `{{baseUrl}}/users/{{createdUserId}}`
- Method: `GET`

The `{{createdUserId}}` is automatically replaced with the value from the previous request!

## Java Code Generation

1. Configure your request (URL, method, headers, body, auth)
2. Click **Code** button
3. Select generator:
   - **Java - RestTemplate** (Spring blocking)
   - **Java - WebClient** (Spring reactive)
   - **Java - Feign Client** (interface-based)
   - **Java - OkHttp** (low-level HTTP)
   - **Java - JUnit Test** (test code with MockMvc)
4. Copy generated code into your Spring Boot project

## UI Overview

### Request Panel (Top)
- **Params Tab:** Query parameters
- **Auth Tab:** Bearer, Basic, API Key, OAuth2
- **Headers Tab:** Custom headers
- **Body Tab:** JSON, XML, Form Data, Raw, Binary
- **Scripts Tab:** Pre-request & Test scripts (Java)

### Response Panel (Bottom)
- **Body Tab:** Response body with syntax highlighting
- **Headers Tab:** Response headers
- **Console Tab:** Script console output (appears after scripts run)
- **Tests Tab:** Test results with pass/fail status (appears after test scripts run)

### Sidebar (Left)
- **Collections:** Organize requests into folders
- **History:** Recent requests
- **Environments:** Variable management

## Tips & Best Practices

### 1. Use Environment Variables
```java
// Instead of hardcoding:
String url = "https://api.prod.example.com/users";

// Use variables:
String baseUrl = (String) pm.getEnvironmentVariable("baseUrl");
String url = baseUrl + "/users";
```

### 2. Add Error Handling in Scripts
```java
try {
    // Your script logic
    String token = extractToken(body);
    pm.setEnvironmentVariable("token", token);
} catch (Exception e) {
    console.error("Failed to extract token:", e.getMessage());
}
```

### 3. Use Helper Methods
```java
// Define helper methods in your scripts
String extractJsonValue(String json, String key) {
    int start = json.indexOf("\"" + key + "\":\"") + key.length() + 4;
    int end = json.indexOf("\"", start);
    return json.substring(start, end);
}

// Use it
String token = extractJsonValue(body, "access_token");
pm.setEnvironmentVariable("token", token);
```

### 4. Log Everything During Development
```java
console.log("Request URL:", pm.getRequest().get("url"));
console.log("Response status:", response.get("statusCode"));
console.log("Response body:", body);
console.log("Extracted token:", token);
```

## Troubleshooting

### Java Sidecar Won't Start

**Symptoms:** Electron app shows "Java sidecar not running"

**Solutions:**
1. Check Java is installed: `java -version` (need 17+)
2. Build the JAR: `cd claracore-java && mvn clean package`
3. Try running manually: `java -jar claracore-java/target/claracore-java-sidecar-1.0.0.jar`
4. Check port 9090 is free: `lsof -i :9090` (Mac/Linux) or `netstat -ano | findstr 9090` (Windows)

### Scripts Don't Execute

**Symptoms:** No output in Console tab, scripts seem to do nothing

**Solutions:**
1. Check Java sidecar is running (should see green indicator)
2. Check browser DevTools console (F12) for errors
3. Verify script syntax - must be valid Java
4. Check script execution results in Response → Console tab

### Variables Not Working

**Symptoms:** `{{variable}}` shows as literal text in requests

**Solutions:**
1. Check environment is active (green checkmark)
2. Verify variable name matches exactly (case-sensitive)
3. Use `pm.setEnvironmentVariable("name", value)` to set
4. Use `pm.getEnvironmentVariable("name")` to retrieve

### Monaco Editor Not Loading

**Symptoms:** Script editor is blank or shows errors

**Solutions:**
1. Check `@monaco-editor/react` is installed: `npm ls @monaco-editor/react`
2. Clear cache and reinstall: `rm -rf node_modules && npm install`
3. Check browser console for errors

## Development

### Project Structure

```
claracore-app/
├── electron/          # Electron main & preload
├── src/
│   ├── components/    # React components
│   ├── lib/          # HTTP client, Java service
│   ├── store/        # Zustand state management
│   └── types/        # TypeScript types
├── package.json
└── vite.config.ts

claracore-java/
├── src/main/java/com/claracore/
│   ├── controller/    # REST endpoints
│   ├── service/      # Script execution (Janino)
│   └── model/        # Request/Response models
└── pom.xml
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Zustand (state)
- Monaco Editor (code editing)
- Tailwind CSS (styling)

**Backend:**
- Spring Boot 3.2
- Janino 3.1 (Java compiler)
- Apache HttpClient 5

**Desktop:**
- Electron (cross-platform)
- electron-builder (packaging)

### Build for Production

```bash
# Build Electron app
cd claracore-app
npm run build

# Creates distributable in claracore-app/dist/
# Includes bundled JRE and Java sidecar
```

## What's Next?

### Completed ✅
- HTTP client (all methods)
- Collections, history, environments
- Authentication (Bearer, Basic, API Key, OAuth2)
- Java code generators (5 types)
- POJO generator
- Java scripting (pre-request & test)
- Console output & test results UI

### Coming Soon ⏳
- Collection Runner (run multiple requests)
- Import/Export Postman collections
- WebSocket support
- GraphQL support
- gRPC support
- Mock servers

---

**Need Help?** Check the console output in the app or browser DevTools (F12) for detailed error messages.

**ClaraCore** - Built with ☕ for Java Developers
