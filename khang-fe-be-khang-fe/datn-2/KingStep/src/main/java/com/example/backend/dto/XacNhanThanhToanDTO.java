package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class XacNhanThanhToanDTO {
    private Double tongTien;
    private Integer idkhachHang;
    private String tenKhachHang;
    private String email;         // Thêm trường này
    private String soDienThoai;
}