package com.example.backend.dto;


import com.example.backend.entity.DonHangChiTiet;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class DonHangChiTietDTO {
    private Integer id;
    private Integer idDonHang;
    private Integer idSanPhamChiTiet;
    private Integer soLuong;
    private Double gia;
    private Double thanhTien;

    public DonHangChiTietDTO(DonHangChiTiet ct) {
        this.id = ct.getId();
        this.idDonHang = ct.getDonHang() != null ? ct.getDonHang().getId() : null;
        this.idSanPhamChiTiet = ct.getSanPhamChiTiet() != null ? ct.getSanPhamChiTiet().getId() : null;
        this.soLuong = ct.getSoLuong();
        this.gia = ct.getGia();
        this.thanhTien = ct.getThanhTien();
    }
}