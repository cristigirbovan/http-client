# ☕ ClaraCore for Java Developers - Feature Summary

## 🎯 What Makes This Java-Specific?

This is **NOT** just another Postman clone. ClaraCore is built specifically for Java and Spring Boot developers with features that Postman doesn't have.

---

## ✨ Exclusive Java Features

### 1. **5 Java Code Generators** (vs Postman's 0)

| Generator | Use Case | Output |
|-----------|----------|--------|
| **RestTemplate** | Traditional Spring Boot | Full RestTemplate implementation |
| **WebClient** | Spring WebFlux/Reactive | WebClient with Mono/Flux |
| **Feign Client** | Microservices/Spring Cloud | Complete `@FeignClient` interface |
| **OkHttp** | Android/Kotlin/Standalone | OkHttpClient code |
| **JUnit/MockMvc** | Integration Testing | Complete test class |

**Postman generates:** curl, Python, JavaScript, etc. (NOT Java)
**ClaraCore generates:** Production-ready Spring Boot code

### 2. **Spring Boot Conventions**

All generated code follows Spring Boot best practices:
- ✅ Uses `HttpHeaders`, `HttpEntity`, `ResponseEntity`
- ✅ Proper exception handling patterns
- ✅ Text blocks for JSON (Java 15+)
- ✅ Lombok-ready POJOs
- ✅ Spring Security integration (Bearer, Basic Auth)

### 3. **Reactive Support**

Generate WebClient code for Spring WebFlux:
```java
Mono<String> response = client.post()
    .uri("/users")
    .bodyValue(user)
    .retrieve()
    .bodyToMono(String.class);
```

**Postman:** No reactive code generation

### 4. **Feign Interface Generation**

Automatic generation of Feign client interfaces:
```java
@FeignClient(name = "user-service", url = "https://api.example.com")
public interface UserClient {
    @PostMapping("/users")
    User createUser(@RequestBody User user);
}
```

**Postman:** Doesn't understand Feign

### 5. **JUnit Test Generation**

Click one button → Get complete Spring Boot test:
```java
@SpringBootTest
@AutoConfigureMockMvc
class ApiTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void testCreateUser() throws Exception {
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "John"}
                    """))
            .andExpect(status().isCreated());
    }
}
```

**Postman:** Can write tests in their scripting language, but NOT JUnit

---

## 🚀 Java Developer Workflows

### Workflow 1: Building a Spring Boot Microservice

**Without ClaraCore:**
1. Read API docs
2. Google "RestTemplate example"
3. Copy from Stack Overflow
4. Fix compilation errors
5. Debug mysterious issues
6. Finally works after 45 minutes

**With ClaraCore:**
1. Test endpoint (30 seconds)
2. Click "Code" → "RestTemplate" (2 seconds)
3. Paste into `@Service` class (5 seconds)
4. Done! ✅

**Time saved:** 40+ minutes per integration

### Workflow 2: Testing Your Own Spring Boot API

**Scenario:** You're building a REST API

**Traditional approach:**
- Use Postman
- Get curl code
- Manually convert to Java
- Or use curl in terminal

**ClaraCore approach:**
1. Run your Spring Boot app: `mvn spring-boot:run`
2. Test in ClaraCore: `http://localhost:8080/api/products`
3. Generate RestTemplate client code
4. Have both client & server code ready!

### Workflow 3: Microservices Communication

**Scenario:** Service A needs to call Service B

**ClaraCore Flow:**
1. Test Service B endpoint
2. Generate Feign interface
3. Add `@EnableFeignClients` to Service A
4. Inject and use the client
5. Done!

**Result:** Type-safe, declarative communication between services

---

## 💡 Real-World Examples

### Example 1: Calling External Payment API

**Task:** Integrate Stripe payment processing

```java
// 1. Test Stripe API in ClaraCore
// 2. Click Code → Java - RestTemplate
// 3. Get this:

@Service
public class PaymentService {
    private final RestTemplate restTemplate;

    public PaymentResponse createCharge(ChargeRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer sk_test_...");
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ChargeRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<PaymentResponse> response = restTemplate.exchange(
            "https://api.stripe.com/v1/charges",
            HttpMethod.POST,
            entity,
            PaymentResponse.class
        );

        return response.getBody();
    }
}
```

### Example 2: Microservice Communication

**Task:** User Service calls Order Service

```java
// Generate Feign interface in ClaraCore:

@FeignClient(name = "order-service", url = "${order.service.url}")
public interface OrderClient {

    @GetMapping("/orders/{id}")
    Order getOrder(@PathVariable("id") Long id);

    @PostMapping("/orders")
    Order createOrder(@RequestBody OrderRequest request);

    @GetMapping("/orders/user/{userId}")
    List<Order> getUserOrders(@PathVariable("userId") Long userId);
}

// Then in UserService:
@Service
public class UserService {

    @Autowired
    private OrderClient orderClient;

    public UserProfile getUserProfile(Long userId) {
        List<Order> orders = orderClient.getUserOrders(userId);
        // ... build profile
    }
}
```

### Example 3: Writing Integration Tests

**Task:** Test your REST controller

```java
// Click Code → Java - JUnit Test

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateProduct() throws Exception {
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Laptop",
                      "price": 999.99,
                      "category": "Electronics"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.name").value("Laptop"));
    }
}
```

---

## 🎨 Additional Java-Friendly Features

### POJO Generator (Coming Soon)

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Springfield"
  }
}
```

**Generates:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class User {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("email")
    private String email;

    @JsonProperty("address")
    private Address address;

    @Data
    public static class Address {
        @JsonProperty("street")
        private String street;

        @JsonProperty("city")
        private String city;
    }
}
```

### Maven/Gradle Dependencies

Quick reference for dependencies:

**RestTemplate:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**WebClient:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

**Feign:**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

---

## 📊 Feature Comparison: ClaraCore vs Postman (for Java Devs)

| Feature | ClaraCore | Postman |
|---------|-----------|---------|
| **RestTemplate code** | ✅ Generated | ❌ Manual |
| **WebClient (Reactive)** | ✅ Generated | ❌ No |
| **Feign interfaces** | ✅ Generated | ❌ No |
| **JUnit tests** | ✅ Generated | ❌ No |
| **Spring Boot patterns** | ✅ Built-in | ❌ Generic |
| **Java syntax highlighting** | ✅ Monaco Editor | ⚠️ Basic |
| **POJO generation** | ✅ Planned | ❌ No |
| **OpenAPI import** | 🔄 Coming | ✅ Yes |
| **Team collaboration** | ❌ Local only | ✅ Yes |
| **Price** | ✅ Free | ⚠️ Freemium |
| **Customizable** | ✅ Open source | ❌ Closed |

---

## 🎯 Best For

### ✅ Perfect Use Cases:
- Spring Boot API development
- Microservices communication (Feign)
- Third-party API integration
- Writing integration tests
- Learning Spring HTTP clients
- Quick prototyping
- Local API testing (localhost:8080)

### ❌ Not Ideal For:
- Team collaboration (no cloud sync yet)
- Complex API testing workflows
- Non-Java projects
- Automated test suites (use the generated JUnit code!)

---

## 🚧 Roadmap (Java-Specific)

### Coming Soon:
- [ ] **OpenAPI/Swagger Import** - Auto-generate Feign clients
- [ ] **POJO Generator** - JSON → Lombok POJOs
- [ ] **Spring Boot Project Generator** - Full starter projects
- [ ] **Spring Data REST** - Repository interface generation
- [ ] **GraphQL** - Spring GraphQL support
- [ ] **WebSocket** - Spring WebSocket testing
- [ ] **Actuator Integration** - Test /actuator endpoints

---

## 💬 FAQ for Java Developers

**Q: Why not just use Postman?**
A: Postman doesn't generate Java code. You still have to manually write RestTemplate/WebClient/Feign code. ClaraCore does it for you.

**Q: Can I customize the generated code?**
A: Yes! It's production-ready but you can modify it. Add error handling, custom headers, retry logic, etc.

**Q: Does it work with Spring Security?**
A: Yes! Add Bearer tokens, JWT, OAuth2 in the Auth tab. Generated code includes security headers.

**Q: What about reactive programming (WebFlux)?**
A: Full support! Generate WebClient code with Mono/Flux.

**Q: Can I test my localhost Spring Boot app?**
A: Absolutely! Perfect for testing `http://localhost:8080` during development.

**Q: Does it integrate with IntelliJ IDEA?**
A: Not yet, but it's a standalone app. Generate code → paste into IDE.

**Q: Can I import OpenAPI/Swagger specs?**
A: Coming soon! High priority feature.

**Q: What Java version is required?**
A: Generated code uses Java 15+ features (text blocks). Adjust if needed.

---

## 🎓 Learning Spring Boot?

ClaraCore is a great learning tool:

1. **See working code examples** - Every generated snippet is production-quality
2. **Learn Spring patterns** - RestTemplate, WebClient, Feign
3. **Understand HTTP clients** - See how Spring handles requests
4. **Practice testing** - Generate JUnit tests, learn MockMvc
5. **Experiment safely** - Test external APIs without writing code first

---

## 🔥 Getting Started

```bash
# Install
cd claracore-app
npm install

# Run
npm run electron:dev

# Try it
1. Enter: https://jsonplaceholder.typicode.com/posts/1
2. Click Send
3. Click Code → Java - RestTemplate
4. See the magic! ✨
```

---

**Built for Java developers who are tired of converting curl to Java code.**

Ready to code in Java, not curl? 🚀

---

## 📖 Documentation

- **README_JAVA.md** - Comprehensive Java guide
- **QUICKSTART.md** - Installation
- **SETUP.md** - Detailed setup
- **DEVELOPMENT_STATUS.md** - Current status

---

**TL;DR:** Postman generates curl. ClaraCore generates Spring Boot. That's the difference.
