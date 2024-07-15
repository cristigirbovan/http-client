package com.claracore.httpstarter.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class WebClientCustom {

    private org.springframework.web.reactive.function.client.WebClient webClient;

    @Autowired
    public WebClientCustom(org.springframework.web.reactive.function.client.WebClient webClient) {
        this.webClient = webClient;
    }

    public <T> Mono<T> callApi(String url, HttpMethod method, Object body, Class<T> responseType) {
        if (method == HttpMethod.POST) {
            return webClient.post().uri(url).bodyValue(body).retrieve().bodyToMono(responseType);
        } else if (method == HttpMethod.PUT) {
            return webClient.put().uri(url).bodyValue(body).retrieve().bodyToMono(responseType);
        } else if (method == HttpMethod.DELETE) {
            return webClient.delete().uri(url).retrieve().bodyToMono(responseType);
        } else if (method == HttpMethod.PATCH) {
            return webClient.patch().uri(url).bodyValue(body).retrieve().bodyToMono(responseType);
        } else {
            // Default to GET method
            return webClient.get().uri(url).retrieve().bodyToMono(responseType);
        }
    }
}
