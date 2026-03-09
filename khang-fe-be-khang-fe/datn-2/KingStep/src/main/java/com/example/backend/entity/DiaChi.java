package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "DiaChi")
public class DiaChi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String tenNguoiNhan;

    private String soDienThoai;

    private String tinhThanh;

    private String quanHuyen;

    private String phuongXa;

    private String diaChiChiTiet;

    private Boolean macDinh;

    @ManyToOne
    @JoinColumn(name = "IdKhachHang")
    @JsonBackReference
    private KhachHang khachHang;

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public String getTenNguoiNhan() { return tenNguoiNhan; }

    public void setTenNguoiNhan(String tenNguoiNhan) { this.tenNguoiNhan = tenNguoiNhan; }

    public String getSoDienThoai() { return soDienThoai; }

    public void setSoDienThoai(String soDienThoai) { this.soDienThoai = soDienThoai; }

    public String getTinhThanh() { return tinhThanh; }

    public void setTinhThanh(String tinhThanh) { this.tinhThanh = tinhThanh; }

    public String getQuanHuyen() { return quanHuyen; }

    public void setQuanHuyen(String quanHuyen) { this.quanHuyen = quanHuyen; }

    public String getPhuongXa() { return phuongXa; }

    public void setPhuongXa(String phuongXa) { this.phuongXa = phuongXa; }

    public String getDiaChiChiTiet() { return diaChiChiTiet; }

    public void setDiaChiChiTiet(String diaChiChiTiet) { this.diaChiChiTiet = diaChiChiTiet; }

    public Boolean getMacDinh() { return macDinh; }

    public void setMacDinh(Boolean macDinh) { this.macDinh = macDinh; }

    public KhachHang getKhachHang() { return khachHang; }

    public void setKhachHang(KhachHang khachHang) { this.khachHang = khachHang; }
}