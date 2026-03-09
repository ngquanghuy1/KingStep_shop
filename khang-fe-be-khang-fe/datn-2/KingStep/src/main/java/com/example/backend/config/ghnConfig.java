package com.example.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ghnConfig {
    @Value("${ghn.token}")
    private String token;

    @Value("${ghn.shopId}")
    private Integer shopId;

    @Value("${ghn.baseUrl}")
    private String baseUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public String ghnToken() {
        return token;
    }

    @Bean
    public Integer ghnShopId() {
        return shopId;
    }

    @Bean
    public String ghnBaseUrl() {
        return baseUrl;
    }

    @PostConstruct
    public void printDebug() {
        System.out.println("GHN Token: " + token);
        System.out.println("Shop ID: " + shopId);
        System.out.println("Base URL: " + baseUrl);
    }
}

