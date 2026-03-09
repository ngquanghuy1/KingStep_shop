package com.example.backend.dto;

import com.example.backend.dto.SanPhamDatDTO;
import lombok.Data;

import java.util.List;

@Data
public class HoaDonOnlineRequest {

    private Integer idKhachHang;
    private String tenNguoiNhan;
    private String diaChiGiaoHang;
    private String soDienThoaiGiaoHang;
    private String emailGiaoHang;
    private Integer idVoucher;
    private List<SanPhamDatDTO> sanPhamDat;
}
