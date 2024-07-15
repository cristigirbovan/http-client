package com.claracore.httpstarter.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import reactor.core.publisher.Mono;

public class WebClientFilter {

    private static final Logger logger = LoggerFactory.getLogger(WebClientFilter.class);

    public static ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(request -> {
            logger.info("Request: {} {}", request.method(), request.url());
            HttpHeaders headers = request.headers();
            headers.forEach((name, values) -> values.forEach(value -> logger.info("{}={}", name, value)));
            return Mono.just(request);
        });
    }

    public static ExchangeFilterFunction logResponse() {
        return ExchangeFilterFunction.ofResponseProcessor(response -> {
            logger.info("Response Status: {}", response.statusCode());
            response.headers().asHttpHeaders().forEach((name, values) -> values.forEach(value -> logger.info("{}={}", name, value)));
            return Mono.just(response);
        });
    }

    public static ExchangeFilterFunction addHeaders(String jwtToken) {
        return ExchangeFilterFunction.ofRequestProcessor(request -> {
            ClientRequest newRequest = ClientRequest.from(request)
                    .header("Authorization", "Bearer " + jwtToken)
                    .header("Custom-Header", "CustomValue")
                    .build();
            return Mono.just(newRequest);
        });
    }
}
