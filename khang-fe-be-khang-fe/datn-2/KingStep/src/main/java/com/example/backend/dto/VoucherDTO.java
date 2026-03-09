package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VoucherDTO {

    private Integer id;

    private String maVoucher;

    private String tenVoucher;

    private String loaiVoucher;

    private String moTa;

    private Integer soLuong;

    private Double giaTri;

    private Double donToiThieu;

    private LocalDateTime ngayBatDau;

    private LocalDateTime ngayKetThuc;

    private Integer trangThai;

    private Boolean isAvailable;

    public Integer getTrangThai() {
        if (ngayBatDau == null || ngayKetThuc == null) {
            return 0; // Hết hạn nếu không có ngày
        }

        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra điều kiện hoạt động
        boolean isExpired = ngayKetThuc.isBefore(now);
        boolean isNotStarted = ngayBatDau.isAfter(now);
        boolean isOutOfStock = soLuong != null && soLuong <= 0;

        // Voucher hoạt động nếu không hết hạn, đã bắt đầu và còn số lượng
        if (!isExpired && !isNotStarted && !isOutOfStock) {
            return 1; // Đang hoạt động
        } else {
            return 0; // Hết hạn
        }
    }

//    public VoucherDTO(String maVoucher, Integer id, String tenVoucher, String loaiVoucher, String moTa, Integer soLuong, Double donToiThieu, Double giaTri, LocalDateTime ngayBatDau, LocalDateTime ngayKetThuc, Integer trangThai, Boolean isAvailable) {
//        this.maVoucher = maVoucher;
//        this.id = id;
//        this.tenVoucher = tenVoucher;
//        this.loaiVoucher = loaiVoucher;
//        this.moTa = moTa;
//        this.soLuong = soLuong;
//        this.donToiThieu = donToiThieu;
//        this.giaTri = giaTri;
//        this.ngayBatDau = ngayBatDau;
//        this.ngayKetThuc = ngayKetThuc;
//        this.trangThai = trangThai;
//        this.isAvailable = isAvailable;
//    }
}

