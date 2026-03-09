


package com.example.backend.dto;


import com.example.backend.entity.DonHang;
import com.example.backend.entity.DonHangChiTiet;
import com.example.backend.enums.TrangThaiDonHang;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

    @AllArgsConstructor
    @NoArgsConstructor
    @Setter
    @Getter
    public class DonHangDTO {

        private Integer id;

        private Integer  idnhanVien;


        private Integer  idkhachHang;


        private String tenNhanVien;


        private Integer  idgiamGia;


        private LocalDate ngayMua;


        private LocalDate ngayTao;


        private String loaiDonHang;


        private Integer trangThai = 0;

        private String trangThaiText;


        private double tongTien;


        private Double tongTienGiamGia;


        private String diaChiGiaoHang;


        private String soDienThoaiGiaoHang;


        private String emailGiaoHang;

        private Integer phiVanChuyen;



        private String tenNguoiNhan;


        private List<DonHangChiTietDTO> donHangChiTiets;


        public DonHangDTO(DonHang dh) {
            this.id = dh.getId();
            this.idnhanVien = dh.getNhanVien() != null ? dh.getNhanVien().getId() : null;
            this.idkhachHang = dh.getKhachHang() != null ? dh.getKhachHang().getId() : null;
            this.idgiamGia = dh.getGiamGia() != null ? dh.getGiamGia().getId() : null;

            this.ngayMua = dh.getNgayMua();
            this.ngayTao = dh.getNgayTao();
            this.loaiDonHang = dh.getLoaiDonHang();

            this.trangThai = dh.getTrangThai();
            this.trangThaiText = TrangThaiDonHang.fromValue(dh.getTrangThai()).name();

            this.tongTien = dh.getTongTien();
            this.tongTienGiamGia = dh.getTongTienGiamGia();
            this.diaChiGiaoHang = dh.getDiaChiGiaoHang();
            this.soDienThoaiGiaoHang = dh.getSoDienThoaiGiaoHang();
            this.emailGiaoHang = dh.getEmailGiaoHang();
            this.tenNguoiNhan = dh.getTenNguoiNhan();


            if (dh.getDonHangChiTiets() != null) {
                this.donHangChiTiets = dh.getDonHangChiTiets().stream()
                        .map(DonHangChiTietDTO::new)
                        .toList();
            }
        }
    }

