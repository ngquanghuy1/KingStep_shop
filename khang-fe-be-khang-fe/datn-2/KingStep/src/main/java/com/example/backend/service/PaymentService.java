package com.example.backend.service;

import com.example.backend.config.VNpayConfig;
import com.example.backend.model.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class PaymentService {

    @Autowired
    private VNpayConfig vnpayConfig;

    @Autowired
    private JavaMailSender mailSender;

    public String createPaymentUrl(int amount, String ipAddress) throws Exception {
        Map<String, String> vnpParams = vnpayConfig.createVNPayParams(amount, ipAddress);

        vnpParams.remove("vnp_SecureHashType");
        vnpParams.remove("vnp_SecureHash");

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnpParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(encodeValue(fieldValue));
                //Build query
                query.append(encodeValue(fieldName));
                query.append('=');
                query.append(encodeValue(fieldValue));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String secretKey = vnpayConfig.getSecretKey().trim();
        String secureHash = VNPayUtil.hmacSHA512(secretKey, hashData.toString());

        System.out.println("=== VNPAY DEBUG INFO ===");
        System.out.println("Secret Key: " + secretKey);
        System.out.println("Hash Data String: " + hashData.toString());
        System.out.println("Generated Secure Hash: " + secureHash);
        System.out.println("Query String: " + query.toString());
        System.out.println("========================");

        return vnpayConfig.getPayUrl() + "?" + query.toString() + "&vnp_SecureHash=" + secureHash;
    }

    private String encodeValue(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.US_ASCII.toString())
                    .replace("+", "%20")
                    .replace("*", "%2A")
                    .replace("%7E", "~");
        } catch (Exception e) {
            return value;
        }
    }

    public String processReturn(HttpServletRequest request) {
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        String amount = request.getParameter("vnp_Amount");

        if ("00".equals(vnp_ResponseCode)) {
            sendSuccessEmail(vnp_TxnRef, amount);
            return "Thanh toán thành công. Mã giao dịch: " + vnp_TxnRef;
        }
        return "Thanh toán thất bại. Mã: " + vnp_ResponseCode;
    }

    private void sendSuccessEmail(String txnRef, String amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("ngovandat10a5@gmail.com"); // bạn có thể cho động luôn
        message.setSubject("Giao dịch thành công với VNPay");
        message.setText("Giao dịch mã: " + txnRef + "\nSố tiền: " + (Integer.parseInt(amount) / 100) + " VNĐ\nCảm ơn bạn đã sử dụng dịch vụ!");
        mailSender.send(message);
    }
}
