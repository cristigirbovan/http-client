package com.claracore.httpstarter.config;

import feign.Feign;
import feign.RequestInterceptor;
import feign.auth.BasicAuthRequestInterceptor;
import feign.httpclient.ApacheHttpClient;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.util.ArrayList;
import java.util.List;

;

@Configuration
public class HttpClientConfig {

    @Value("${jwt.token}")
    private String jwtToken;

    @Value("${basic.auth.username}")
    private String basicAuthUsername;

    @Value("${basic.auth.password}")
    private String basicAuthPassword;

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate(clientHttpRequestFactory());
        List<ClientHttpRequestInterceptor> interceptors = new ArrayList<>();
        interceptors.add(restTemplateInterceptor());
        restTemplate.setInterceptors(interceptors);
        return restTemplate;
    }

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(HttpClient.create()))
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                        .build())
                .filter(WebClientFilter.addHeaders(jwtToken))
                .filter(WebClientFilter.logRequest())
                .filter(WebClientFilter.logResponse())
                .build();
    }

    @Bean
    public Feign.Builder feignBuilder() {
        return Feign.builder()
                .client(new ApacheHttpClient(HttpClients.createDefault()))
                .encoder(new JacksonEncoder())
                .decoder(new JacksonDecoder())
                .requestInterceptor(feignRequestInterceptor());
    }

    @Bean
    public RequestInterceptor feignRequestInterceptor() {
        return requestTemplate -> {
            requestTemplate.header("Authorization", "Bearer " + jwtToken);
            requestTemplate.header("Custom-Header", "CustomValue");
        };
    }

    @Bean
    public ClientHttpRequestInterceptor restTemplateInterceptor() {
        return (request, body, execution) -> {
            request.getHeaders().add("Authorization", "Bearer " + jwtToken);
            request.getHeaders().add("Custom-Header", "CustomValue");
            return execution.execute(request, body);
        };
    }

    @Bean
    public BasicAuthRequestInterceptor basicAuthRequestInterceptor() {
        return new BasicAuthRequestInterceptor(basicAuthUsername, basicAuthPassword);
    }

    private ClientHttpRequestFactory clientHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        return factory;
    }
}
