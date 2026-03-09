import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class TestHash {
    public static void main(String[] args) {
        // Test values from VNPAY official documentation
        String vnp_TmnCode = "D1RFW8T3";
        String secretKey = "HTYZLMTJOPKMWFCHXAJIIGTIFKORXJBN";
        
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnp_TmnCode);
        vnpParams.put("vnp_Amount", "1000000");
        vnpParams.put("vnp_BankCode", "NCB");
        vnpParams.put("vnp_CreateDate", "20210809102435");
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_IpAddr", "127.0.0.1");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang: 99");
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_ReturnUrl", "http://localhost:8080/vnpay_jsp/vnpay_return.jsp");
        vnpParams.put("vnp_TxnRef", "99");
        vnpParams.put("vnp_ExpireDate", "20210809103935");

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnpParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                
                try {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(encodeValue(fieldValue));
                //Build query
                query.append(encodeValue(fieldName));
                query.append('=');
                query.append(encodeValue(fieldValue));
                } catch(Exception e) {}

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String secureHash = hmacSHA512(secretKey, hashData.toString());

        System.out.println("HashData String: \n" + hashData.toString());
        System.out.println("SecureHash Expected By Docs (v2.1.0): "); // Not provided by docs, but we can verify our own encode string
        System.out.println("Generated   : \n" + secureHash);
    }

    private static String encodeValue(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.US_ASCII.toString())
                    .replace("+", "%20")
                    .replace("*", "%2A")
                    .replace("%7E", "~");
                    // .replace("%3A", ":") // Let's check without this first
        } catch (Exception e) {
            return value;
        }
    }

    public static String hmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes();
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }
}
