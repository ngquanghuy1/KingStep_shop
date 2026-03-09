package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="donHangChiTiet")

public class DonHangChiTiet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "idDonHang")
    private DonHang donHang;

    @ManyToOne
    @JoinColumn(name = "idSanPhamChiTiet")
    private SanPhamChiTiet sanPhamChiTiet;

    @Column( name = "soLuong")
    private Integer soLuong;

    @Column( name = "gia")
    private Double gia;

    @Column( name = "thanhTien")
    private Double thanhTien;
}
