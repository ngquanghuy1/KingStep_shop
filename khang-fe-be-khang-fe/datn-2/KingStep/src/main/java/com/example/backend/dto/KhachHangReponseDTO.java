package com.example.backend.dto;



import lombok.*;


import java.time.LocalDate;
import java.util.Date;


@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class KhachHangReponseDTO {


    private Integer id;




    private String tenKhachHang;


    private String email;


    private Date ngaySinh;


    private Boolean gioiTinh;


    private String diaChi;


    private String soDienThoai;




    private Boolean trangThai;


    private String maThongBao;


    private LocalDate thoiGianThongBao;
}
