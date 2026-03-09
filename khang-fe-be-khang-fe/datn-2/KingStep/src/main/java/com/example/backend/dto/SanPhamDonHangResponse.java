package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class SanPhamDonHangResponse {
    private String tenSanPham;
    private String tenKichThuoc;
    private String tenMauSac;
    private Integer soLuong;
    private Double thanhTien;
}
