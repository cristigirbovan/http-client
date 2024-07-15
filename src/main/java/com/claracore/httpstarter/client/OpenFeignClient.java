package com.claracore.httpstarter.client;

import feign.Feign;
import feign.Logger;
import feign.Param;
import feign.RequestLine;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import feign.slf4j.Slf4jLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;

@Component
public class OpenFeignClient {

    private final Feign.Builder feignBuilder;

    @Autowired
    public OpenFeignClient(Feign.Builder feignBuilder) {
        this.feignBuilder = feignBuilder
                .decoder(new JacksonDecoder())
                .encoder(new JacksonEncoder())
                .logger(new Slf4jLogger())
                .logLevel(Logger.Level.FULL);
    }

    public <T> T callApi(String baseUrl, String method, String url, Object body) {
        MyFeignClient client = feignBuilder.target(MyFeignClient.class, baseUrl);
        switch (method.toUpperCase()) {
            case "GET":
                return client.get(url);
            case "POST":
                return client.post(url, body);
            case "PUT":
                return client.put(url, body);
            case "DELETE":
                return client.delete(url);
            case "PATCH":
                return client.patch(url, body);
            default:
                throw new UnsupportedOperationException("Unsupported HTTP method: " + method);
        }
    }

    private interface MyFeignClient {
        @RequestLine("GET {url}")
        <T> T get(@Param("url") String url);

        @RequestLine("POST {url}")
        <T> T post(@Param("url") String url, @RequestBody Object body);

        @RequestLine("PUT {url}")
        <T> T put(@Param("url") String url, @RequestBody Object body);

        @RequestLine("DELETE {url}")
        <T> T delete(@Param("url") String url);

        @RequestLine("PATCH {url}")
        <T> T patch(@Param("url") String url, @RequestBody Object body);
    }
}
