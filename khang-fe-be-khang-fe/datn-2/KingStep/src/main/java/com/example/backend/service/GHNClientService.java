package com.example.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GHNClientService {


    @Value("${ghn.token}")
    private String ghnToken;

    @Value("${ghn.shopId}")
    private Integer ghnShopId;

    private final RestTemplate restTemplate;


    public GHNClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Value("${ghn.baseUrl}")
    private String ghnBaseUrl;

    public int tinhPhiVanChuyen(Integer toDistrictId, String toWardCode, int weightGram) {
        String url = ghnBaseUrl + "/v2/shipping-order/fee";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);
        headers.set("ShopId", String.valueOf(ghnShopId));

        Map<String, Object> body = Map.of(
                "from_district_id", 1442,
                "to_district_id", toDistrictId,
                "to_ward_code", toWardCode,
                "service_type_id", 2,
                "height", 10,
                "length", 20,
                "width", 10,
                "weight", weightGram,
                "insurance_value", 0
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        System.out.println("GHN Token = " + ghnToken);
        System.out.println("GHN ShopId = " + ghnShopId);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody == null || !(responseBody.get("data") instanceof Map))
                throw new RuntimeException("GHN trả về dữ liệu không hợp lệ!");

            Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
            return (Integer) data.get("total");

        } catch (HttpClientErrorException ex) {
            System.err.println("GHN API lỗi: " + ex.getStatusCode());
            System.err.println("Body GHN: " + ex.getResponseBodyAsString());
            throw new RuntimeException("GHN từ chối request! Kiểm tra lại token/ShopId hoặc headers.");
        }


    }

    @PostConstruct
    public void init() {
        System.out.println("Config loaded → Token: " + ghnToken + ", ShopId: " + ghnShopId);
    }
}
