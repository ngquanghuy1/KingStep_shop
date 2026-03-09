package com.example.backend.dto;

import lombok.Data;
import java.util.Date;

@Data
public class DangKyRequest {
    private String tenKhachHang;
    private String email;
    private String soDienThoai;
    private String matKhau;
    private Boolean gioiTinh;
    private String diaChi;
    private Date ngaySinh;
}
