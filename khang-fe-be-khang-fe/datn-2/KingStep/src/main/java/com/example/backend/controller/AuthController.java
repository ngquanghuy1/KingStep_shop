package com.example.backend.controller;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.DangNhapRequest;
import com.example.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/dang-nhap")
    public ResponseEntity<AuthResponse> dangNhap(@RequestBody DangNhapRequest req) {
        AuthResponse res = authService.dangNhap(req);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/dang-ky")
    public ResponseEntity<?> dangKy(@RequestBody com.example.backend.dto.DangKyRequest req) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        try {
            authService.dangKy(req);
            response.put("success", true);
            response.put("message", "Đăng ký thành công!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
