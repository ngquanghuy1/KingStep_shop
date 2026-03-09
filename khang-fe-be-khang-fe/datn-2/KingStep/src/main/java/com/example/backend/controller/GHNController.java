package com.example.backend.controller;

import com.example.backend.model.*;
import com.example.backend.service.GHNClientService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ghn")
public class GHNController {

    private final RestTemplate restTemplate;
    private final GHNClientService ghnClientService;

    @Value("${ghn.token}")
    private String ghnToken;

    @Value("${ghn.baseUrl}")
    private String ghnBaseUrl;

    public GHNController(RestTemplate restTemplate, GHNClientService ghnClientService) {
        this.restTemplate = restTemplate;
        this.ghnClientService = ghnClientService;
    }

    /**
     * Lấy danh sách tỉnh/thành từ GHN
     */
    @GetMapping("/provinces")
    public ResponseEntity<?> getProvinces() {
        String url = ghnBaseUrl + "/master-data/province";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<GhnResponseWrapper<List<Province>>> response =
                restTemplate.exchange(url, HttpMethod.GET, request,
                        (Class<GhnResponseWrapper<List<Province>>>) (Class<?>) GhnResponseWrapper.class);

        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    /**
     * Lấy danh sách quận/huyện theo ProvinceID
     */
    @GetMapping("/districts/{provinceId}")
    public ResponseEntity<?> getDistricts(@PathVariable("provinceId") Integer provinceId) {
        String url = ghnBaseUrl + "/master-data/district";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("province_id", provinceId);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<GhnResponseWrapper<List<District>>> response =
                restTemplate.exchange(url, HttpMethod.POST, request,
                        (Class<GhnResponseWrapper<List<District>>>) (Class<?>) GhnResponseWrapper.class);

        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    /**
     * Lấy danh sách phường/xã theo DistrictID
     */
    @GetMapping("/wards/{districtId}")
    public ResponseEntity<?> getWards(@PathVariable("districtId") Integer districtId) {
        String url = ghnBaseUrl + "/master-data/ward";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("district_id", districtId);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<GhnResponseWrapper<List<Ward>>> response =
                restTemplate.exchange(url, HttpMethod.POST, request,
                        (Class<GhnResponseWrapper<List<Ward>>>) (Class<?>) GhnResponseWrapper.class);

        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    /**
     * Tính phí vận chuyển – dùng trong FE (Payment, ShippingCalculator, ...)
     */
    @PostMapping("/calculate-fee")
    public ResponseEntity<?> calculateFee(@RequestBody FeeRequest feeRequest) {
        int fee = ghnClientService.tinhPhiVanChuyen(
                feeRequest.getToDistrict(),
                feeRequest.getToWardCode(),
                feeRequest.getWeight()
        );

        Map<String, Object> result = new HashMap<>();
        result.put("total_fee", fee);

        return ResponseEntity.ok(result);
    }
}


