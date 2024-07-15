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

public void makeApiCall() {
    String url = "https://api.example.com/data";
    String client = "WebClient";
    String method = "GET";
    boolean async = false;
    int timeout = 5000;
    int rateLimit = 10;
    Object body = null;
    Class<MyResponse> responseType = MyResponse.class;

    try {
        MyResponse response = externalApiService.makeRequest(url, client, method, async, timeout, rateLimit, body, responseType);
    } catch (Throwable throwable) {
        throwable.printStackTrace();
    }
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
