# ☕ ClaraCore - HTTP Client for Java & Spring Boot Developers

> A standalone HTTP client application designed specifically for Java and Spring Boot developers. Like Postman, but speaks Java!

## Why ClaraCore for Java Developers?

**Problem:** Postman generates generic curl commands. You need Java code for your Spring Boot projects.

**Solution:** ClaraCore generates production-ready Java code with Spring Boot best practices.

### ✨ Java-Specific Features

- **5 Java HTTP Client Generators**
  - Spring RestTemplate
  - Spring WebClient (Reactive)
  - OpenFeign Client interfaces
  - OkHttp
  - JUnit/MockMvc tests

- **POJO Generator** from JSON responses (with Lombok)
- **Spring Boot Authentication** templates (JWT, OAuth2)
- **Maven/Gradle Dependencies** snippets
- **Spring Profiles** support

---

## 🚀 Quick Start for Java Developers

### 1. Install & Run
```bash
cd claracore-app
npm install
npm run electron:dev
```

### 2. Test a Spring Boot API
1. Enter your API URL: `http://localhost:8080/api/users`
2. Click **Send**
3. Click **Code** button
4. Select **Java - RestTemplate**
5. Copy the generated code!

### 3. Generated Code Example

**Your API Request:**
- Method: POST
- URL: `http://localhost:8080/api/users`
- Body: `{"name": "John", "email": "john@example.com"}`

**ClaraCore Generates:**
```java
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

public class ApiClient {
    public static void main(String[] args) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody = """
                {
                  "name": "John",
                  "email": "john@example.com"
                }
                """;

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
            "http://localhost:8080/api/users",
            HttpMethod.POST,
            entity,
            String.class
        );

        System.out.println("Status: " + response.getStatusCode());
        System.out.println("Response: " + response.getBody());
    }
}
```

---

## 💎 Java Code Generation Options

### 1. **RestTemplate** (Traditional Spring)
```java
RestTemplate restTemplate = new RestTemplate();
HttpHeaders headers = new HttpHeaders();
headers.setBearerAuth("your-token");
// ... full implementation
```
**Best for:** Traditional Spring Boot applications, synchronous calls

### 2. **WebClient** (Reactive)
```java
WebClient client = WebClient.builder()
    .baseUrl("https://api.example.com")
    .build();

Mono<String> response = client.post()
    .uri("/users")
    .bodyValue(user)
    .retrieve()
    .bodyToMono(String.class);
```
**Best for:** Spring WebFlux, reactive applications, async operations

### 3. **Feign Client** (Declarative)
```java
@FeignClient(name = "api-client", url = "https://api.example.com")
public interface ApiClient {
    @PostMapping("/users")
    String createUser(@RequestBody String body);
}
```
**Best for:** Microservices, clean interfaces, Spring Cloud

### 4. **OkHttp** (Android/Kotlin)
```java
OkHttpClient client = new OkHttpClient();
RequestBody body = RequestBody.create(
    json,
    MediaType.parse("application/json")
);
Request request = new Request.Builder()
    .url("https://api.example.com/users")
    .post(body)
    .build();
```
**Best for:** Android apps, Kotlin projects, standalone Java

### 5. **JUnit/MockMvc Tests**
```java
@SpringBootTest
@AutoConfigureMockMvc
class ApiTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void testApiEndpoint() throws Exception {
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "John"}
                    """))
            .andExpect(status().isOk());
    }
}
```
**Best for:** Integration tests, controller testing

---

## 🎯 Common Use Cases

### Use Case 1: Testing Your Spring Boot API

**Scenario:** You're developing a REST API and need to test endpoints quickly.

**Workflow:**
1. Start your Spring Boot app: `mvn spring-boot:run`
2. Open ClaraCore
3. Enter: `http://localhost:8080/api/products`
4. Add headers (if JWT required)
5. Click Send → See response
6. Click Code → Get RestTemplate implementation
7. Paste into your service class!

### Use Case 2: Calling External APIs

**Scenario:** Integrating with a third-party API (Stripe, SendGrid, etc.)

**Workflow:**
1. Add API endpoint in ClaraCore
2. Configure authentication (API Key/Bearer)
3. Test the request
4. Generate WebClient code
5. Copy into your `@Service` class
6. Add error handling and retry logic

### Use Case 3: Writing Integration Tests

**Scenario:** Need JUnit tests for your controllers

**Workflow:**
1. Test endpoint manually in ClaraCore
2. Click Code → Select "Java - JUnit Test"
3. Get complete MockMvc test
4. Copy to `src/test/java`
5. Customize assertions
6. Run tests!

### Use Case 4: Building Feign Clients

**Scenario:** Microservices communication

**Workflow:**
1. Test the target microservice API
2. Generate Feign interface
3. Add to your Spring Cloud project
4. Use `@EnableFeignClients`
5. Inject and use!

---

## 🔧 Java Developer Workflow

### Traditional Flow (Without ClaraCore):
1. Read API documentation
2. Google "how to call REST API in Spring Boot"
3. Copy/paste from Stack Overflow
4. Fix compilation errors
5. Debug why it doesn't work
6. Finally get it working

**Time: 30-60 minutes**

### With ClaraCore:
1. Test API in ClaraCore (2 min)
2. Click "Code" button (1 sec)
3. Select "Java - RestTemplate" (1 sec)
4. Copy/paste working code (5 sec)
5. Done!

**Time: 3 minutes**

---

## 📚 Spring Boot Integration Examples

### Example 1: Service Layer
```java
@Service
public class UserService {
    private final RestTemplate restTemplate;

    public UserService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public User createUser(UserDTO dto) {
        // Paste code from ClaraCore here
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<UserDTO> entity = new HttpEntity<>(dto, headers);

        ResponseEntity<User> response = restTemplate.exchange(
            "https://api.example.com/users",
            HttpMethod.POST,
            entity,
            User.class
        );

        return response.getBody();
    }
}
```

### Example 2: Reactive Service
```java
@Service
public class ProductService {
    private final WebClient webClient;

    public ProductService(WebClient.Builder builder) {
        this.webClient = builder
            .baseUrl("https://api.example.com")
            .build();
    }

    public Mono<Product> getProduct(Long id) {
        // Paste WebClient code from ClaraCore
        return webClient.get()
            .uri("/products/{id}", id)
            .retrieve()
            .bodyToMono(Product.class);
    }
}
```

---

## 🎨 Additional Features

### Authentication

**Bearer Token:**
```java
headers.setBearerAuth("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
```

**Basic Auth:**
```java
headers.setBasicAuth("username", "password");
```

**API Key:**
```java
headers.set("X-API-Key", "your-api-key");
```

### Request History
- Auto-saves all requests
- Quick reload previous requests
- Perfect for iterative API testing

### Collections
- Organize requests by project
- Save common endpoints
- Share with team (export/import coming soon)

### Environment Variables
- Use `{{baseUrl}}` in requests
- Switch between dev/staging/prod
- Keep sensitive data separate

---

## 📦 Dependencies Reference

### RestTemplate
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### WebClient
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### Feign
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

### OkHttp
```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.12.0</version>
</dependency>
```

---

## 🆚 vs Postman

| Feature | ClaraCore | Postman |
|---------|-----------|---------|
| **Java Code Generation** | ✅ 5 variants | ❌ Only curl |
| **JUnit Test Generation** | ✅ Yes | ❌ No |
| **Spring Boot Focus** | ✅ Yes | ❌ Generic |
| **Feign Interfaces** | ✅ Yes | ❌ No |
| **WebClient (Reactive)** | ✅ Yes | ❌ No |
| **Customizable** | ✅ Open source | ❌ Proprietary |
| **Price** | ✅ Free | ⚠️ Freemium |

---

## 🎓 Learning Resources

### Spring Boot REST APIs
- Use ClaraCore to test while building
- Generate code, learn the patterns
- Iterate faster

### Microservices Communication
- Test service-to-service calls
- Generate Feign clients
- Perfect for Spring Cloud projects

### API Integration
- Test third-party APIs safely
- Get working code immediately
- Focus on business logic, not HTTP plumbing

---

## 🤝 Perfect For:

- ✅ Spring Boot developers
- ✅ Java backend engineers
- ✅ Microservices architects
- ✅ API integration teams
- ✅ Students learning Spring
- ✅ Teams standardizing on Spring Boot

---

## 📖 Full Documentation

- **QUICKSTART.md** - Installation guide
- **SETUP.md** - Detailed setup instructions
- **DEVELOPMENT_STATUS.md** - Current features and roadmap

---

## 🚧 Roadmap

### Coming Soon:
- [ ] OpenAPI/Swagger import
- [ ] Generate full Spring Boot projects
- [ ] Lombok POJO generation from JSON
- [ ] Spring Data REST integration
- [ ] GraphQL support for Spring GraphQL
- [ ] WebSocket testing (Spring WebSocket)

---

## 💡 Tips for Java Developers

1. **Use Collections** - Organize by microservice or external API
2. **Environment Variables** - Set `{{baseUrl}}` for dev/prod switching
3. **Save as Tests** - Generate JUnit tests for documentation
4. **Auth Templates** - Save common JWT patterns
5. **Code Generation** - Always generate code, learn the patterns

---

## 🤔 FAQ

**Q: Can I use this with existing Spring Boot projects?**
A: Yes! Generate code and paste into your `@Service` classes.

**Q: Does it work with Spring Security?**
A: Yes! Add JWT/OAuth2 tokens in the Auth tab.

**Q: Can I test localhost Spring Boot apps?**
A: Yes! Perfect for testing `http://localhost:8080` during development.

**Q: What about reactive Spring (WebFlux)?**
A: WebClient code generation is built-in!

**Q: Can I share requests with my team?**
A: Export/import coming soon. For now, use Collections.

---

**Built for Java developers, by developers who understand Spring Boot.**

🚀 Start testing your APIs the Java way!
