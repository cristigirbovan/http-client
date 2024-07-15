# HTTP Client

The `http-client` project is a HTTP client abstraction that simplifies making HTTP requests using different clients like `RestTemplate`, `WebClient`, and `OpenFeignClient`. It supports various features such as asynchronous calls, rate limiting, and timeout management.

## Features

- **Multiple HTTP Clients**: Supports `RestTemplate`, `WebClient`, and `OpenFeignClient`.
- **Asynchronous and Synchronous Calls**: Make requests either asynchronously or synchronously based on configuration.
- **Rate Limiting**: Control the frequency of API calls per URL.
- **Timeout Management**: Set timeouts to ensure requests do not hang indefinitely.
- **Parallel API Calls**: Execute multiple API calls in parallel.

## Getting Started

### Prerequisites

- Java 11 or higher
- Maven

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/cristigirbovan/http-client.git
    ```
2. Navigate to the project directory:
    ```sh
    cd http-client
    ```
3. Build the project using Maven:
    ```sh
    mvn clean install
    ```

### Configuration

The project can be configured using the following main classes:

- **`ExternalApiService`**: Main service for making API calls.
- **`ApiCallConfig`**: Configuration holder for API call parameters.

### Usage

#### Making a Single API Request

You can make a single API request using the `makeRequest` method from `ExternalApiService`.

```java
@Autowired
private ExternalApiService externalApiService;

@GetMapping("/getPostRT")
public Object getPostRT(@RequestParam String postId) throws Throwable {
	String url = "https://jsonplaceholder.typicode.com/posts/" + postId;
    return externalApiService.makeRequest(url, "RestTemplate", "GET", true, 5000, 5, null, Object.class);
}

@GetMapping("/getPostWC")
public Object getPostWC(@RequestParam String postId) throws Throwable {
	String url = "https://jsonplaceholder.typicode.com/posts/" + postId;
	return externalApiService.makeRequest(url, "WebClient", "GET", false, 5000, 5, null, Object.class);
}

@GetMapping("/getPostOF")
public Object getPostOF(@RequestParam String postId) throws Throwable {
	String url = "https://jsonplaceholder.typicode.com/posts/" + postId;
	return externalApiService.makeRequest(url, "OpenFeign", "GET", false, 5000, 5, null, Object.class);
}

@PostMapping("/createPostRT")
public Object createPostRT(@RequestBody Map<String, Object> requestBody) throws Throwable {
	String url = "https://jsonplaceholder.typicode.com/posts";
	return externalApiService.makeRequest(url, "RestTemplate", "POST", false, 5000, 5, requestBody, Object.class);
}

@PostMapping("/createPostWC")
public Object createPostWC(@RequestBody Map<String, Object> requestBody) throws Throwable {
	String url = "https://jsonplaceholder.typicode.com/posts";
	return externalApiService.makeRequest(url, "WebClient", "POST", true, 5000, 5, requestBody, Object.class);
}

@PostMapping("/createPostOF")
public Object createPostOF(@RequestBody Map<String, Object> requestBody) throws Throwable {
	String url = "https://jsonplaceholder.typicode.com/posts";
	return externalApiService.makeRequest(url, "OpenFeign", "POST", true, 5000, 5, requestBody, Object.class);
}
```
You can make parallel API calls using the `callApisInParallel` method from `ExternalApiService`.
```java
@Autowired
private ExternalApiService externalApiService;

@GetMapping("/makeParallelApiCalls")
public List<Object> makeParallelApiCalls() {
    List<ApiCallConfig> configs = Arrays.asList(
                new ApiCallConfig("https://jsonplaceholder.typicode.com/posts/1", "RestTemplate", HttpMethod.GET, false, 5000, 10, null, Object.class)
                ,new ApiCallConfig("https://jsonplaceholder.typicode.com/posts/2", "OpenFeign", HttpMethod.GET, true, 5000, 10, null, Object.class)
                ,new ApiCallConfig("https://jsonplaceholder.typicode.com/posts/3", "WebClient", HttpMethod.GET, false, 5000, 10, null, Object.class)
                ,new ApiCallConfig("https://jsonplaceholder.typicode.com/posts/4", "OpenFeign", HttpMethod.GET, false, 5000, 10, null, Object.class)
                ,new ApiCallConfig("https://jsonplaceholder.typicode.com/posts/5", "OpenFeign", HttpMethod.GET, false, 5000, 10, null, Object.class)
                ,new ApiCallConfig("https://jsonplaceholder.typicode.com/posts/6", "WebClient", HttpMethod.GET, true, 5000, 10, null, Object.class)
                ,new ApiCallConfig("https://jsonplaceholder.typicode.com/posts/7", "RestTemplate", HttpMethod.GET, false, 5000, 10, null, Object.class)
        );
    return externalApiService.callApisInParallel(configs);
}
```
