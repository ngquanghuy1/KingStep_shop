package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Voucher")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "MaVoucher")
    private String maVoucher;

    @Column(name = "TenVoucher")
    private String tenVoucher;

    @Column(name = "LoaiVoucher")
    private String loaiVoucher;

    @Column(name = "MoTa")
    private String moTa;

    @Column(name = "SoLuong")
    private Integer soLuong;

    @Column(name = "DonToiThieu")
    private Double donToiThieu;

    @Column(name = "GiaTri")
    private Double giaTri;

    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.sss")
    @Column(name = "NgayBatDau")
    private LocalDateTime ngayBatDau;

    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.sss")
    @Column(name = "NgayKetThuc")
    private LocalDateTime ngayKetThuc;

    @Column(name = "TrangThai")
    private Integer trangThai;

}
