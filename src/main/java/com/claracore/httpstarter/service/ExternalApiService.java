package com.claracore.httpstarter.service;

import com.claracore.httpstarter.client.OpenFeignClient;
import com.claracore.httpstarter.client.RestTemplateClient;
import com.claracore.httpstarter.client.WebClientCustom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.List;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
public class ExternalApiService {

    @Autowired
    private RestTemplateClient restTemplateClient;

    @Autowired
    private WebClientCustom webClientClient;

    @Autowired
    private OpenFeignClient openFeignClient;

    private final ConcurrentHashMap<String, Semaphore> rateLimiters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService timeoutScheduler = Executors.newScheduledThreadPool(10);

    public <T> T makeRequest(String url, String client, String method, boolean async, int timeout, int rateLimit, Object body, Class<T> responseType) throws Throwable {
        HttpMethod httpMethod = HttpMethod.valueOf(method.toUpperCase());
        initializeRateLimiter(url, rateLimit);

        Callable<T> callable = () -> executeApiCall(url, client, httpMethod, body, responseType, async);

        return executeWithRateLimiterAndTimeout(callable, url, timeout);
    }

    public List<Object> callApisInParallel(List<ApiCallConfig> apiCallConfigs) {
        List<CompletableFuture<Object>> futures = apiCallConfigs.stream()
                .map(config -> CompletableFuture.supplyAsync(() -> {
                    try {
                        return (Object) makeRequest(
                                config.getUrl(),
                                config.getClient(),
                                config.getMethod().name(),
                                config.isAsync(),
                                config.getTimeout(),
                                config.getRateLimit(),
                                config.getBody(),
                                config.getResponseType()
                        );
                    } catch (Throwable throwable) {
                        throw new RuntimeException("API call failed: " + config.getUrl(), throwable);
                    }
                }))
                .toList();

        return futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());
    }

    private <T> void initializeRateLimiter(String url, int rateLimit) {
        rateLimiters.putIfAbsent(url, new Semaphore(rateLimit));
    }

    private <T> T executeWithRateLimiterAndTimeout(Callable<T> callable, String url, int timeout) throws Throwable {
        Semaphore rateLimiter = rateLimiters.get(url);

        if (!rateLimiter.tryAcquire(timeout, TimeUnit.MILLISECONDS)) {
            throw new TimeoutException("Rate limit exceeded for " + url);
        }

        Future<T> future = timeoutScheduler.submit(callable);

        try {
            return future.get(timeout, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new TimeoutException("Request to " + url + " timed out");
        } catch (Exception e) {
            throw new ExecutionException(e);
        } finally {
            rateLimiter.release();
        }
    }

    private <T> T executeApiCall(String url, String client, HttpMethod method, Object body, Class<T> responseType, boolean async) {
        if (async) {
            return callApiAsync(url, client, method, body, responseType).block();
        } else {
            return callApiSync(url, client, method, body, responseType);
        }
    }

    public <T> T callApiSync(String url, String client, HttpMethod method, Object body, Class<T> responseType) {
        URI uri = URI.create(url);
        String baseUrl = uri.getScheme() + "://" + uri.getHost();
        String path = uri.getPath();

        return switch (client) {
            case "WebClient" -> webClientClient.callApi(url, method, body, responseType).block();
            case "OpenFeign" -> openFeignClient.callApi(baseUrl, method.name(), path, body);
            default -> handleRestTemplateCall(url, method, body, responseType);
        };
    }

    @Async
    public <T> Mono<T> callApiAsync(String url, String client, HttpMethod method, Object body, Class<T> responseType) {
        return switch (client) {
            case "WebClient" -> webClientClient.callApi(url, method, body, responseType);
            case "OpenFeign" -> {
                URI uri = URI.create(url);
                String baseUrl = uri.getScheme() + "://" + uri.getHost();
                String path = uri.getPath();
                yield Mono.just(openFeignClient.callApi(baseUrl, method.name(), path, body));
            }
            default -> Mono.just(handleRestTemplateCall(url, method, body, responseType));
        };
    }

    private <T> T handleRestTemplateCall(String url, HttpMethod method, Object body, Class<T> responseType) {
        if (method == HttpMethod.PATCH) {
            return responseType.cast(restTemplateClient.patchApi(url, body).getBody());
        } else {
            return responseType.cast(restTemplateClient.callApi(url, method, body).getBody());
        }
    }
}
