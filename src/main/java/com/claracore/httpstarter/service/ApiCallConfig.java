package com.claracore.httpstarter.service;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import org.springframework.http.HttpMethod;

@Getter
@AllArgsConstructor
@ToString
public class ApiCallConfig {

    private final String url;
    private final String client;
    private final HttpMethod method;
    private final boolean async;
    private final int timeout;
    private final int rateLimit;
    private final Object body;
    private Class<?> responseType;
}
