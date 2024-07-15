package com.claracore.httpstarter.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class RestTemplateClient {

    private final RestTemplate restTemplate;

    @Autowired
    public RestTemplateClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<String> callApi(String url, HttpMethod method, Object body) {
        HttpEntity<Object> entity = new HttpEntity<>(body);
        return restTemplate.exchange(url, method, entity, String.class);
    }

    public ResponseEntity<String> patchApi(String url, Object body) {
        HttpEntity<Object> entity = new HttpEntity<>(body);
        return restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
    }
}
