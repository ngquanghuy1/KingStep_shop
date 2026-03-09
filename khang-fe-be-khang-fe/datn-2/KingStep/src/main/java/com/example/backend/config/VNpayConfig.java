package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class VNpayConfig {

    @Value("${vnp_TmnCode}")
    private String vnpTmnCode;

    @Value("${vnp_HashSecret}")
    private String vnpHashSecret;

    @Value("${vnp_Url}")
    private String vnpUrl;

    @Value("${vnp_ReturnUrl}")
    private String vnpReturnUrl;

    // Trả về URL thanh toán
    public String getPayUrl() {
        return vnpUrl;
    }

    // Trả về secret key
    public String getSecretKey() {
        return vnpHashSecret;
    }

    // Tạo các tham số thanh toán VNPay
    public Map<String, String> createVNPayParams(int amount, String ipAddress) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpTmnCode);
        params.put("vnp_Amount", String.valueOf(amount * 100)); // đơn vị VND * 100
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", String.valueOf(System.currentTimeMillis()));
        params.put("vnp_OrderInfo", "Thanh toan don hang");
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpReturnUrl);
        params.put("vnp_IpAddr", ipAddress);
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(java.util.TimeZone.getTimeZone("GMT+7"));
        java.util.Calendar cld = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("GMT+7"));
        
        String vnp_CreateDate = formatter.format(cld.getTime());
        params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(java.util.Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        params.put("vnp_ExpireDate", vnp_ExpireDate);
        return params;
    }
}
