package com.example.backend.dto;




import lombok.Data;

@Data
public class SanPhanDTO {
    private String tenSanPham;
    private Integer idDanhMuc;
    private Integer idThuongHieu;
    private Integer idChatLieu;
    private Integer idXuatXu;
    private Integer idKhuyenMai;
    private String imanges;
    private Integer trangThai;
}
