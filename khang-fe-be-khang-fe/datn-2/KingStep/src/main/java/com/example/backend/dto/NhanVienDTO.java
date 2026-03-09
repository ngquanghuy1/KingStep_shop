
package com.example.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.time.LocalDate;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class NhanVienDTO {


    private Integer id;

    private String tenNhanVien;


    private String email;


    private String soDienThoai;


    private LocalDate ngaySinh;


    private Boolean gioiTinh;


    private String diaChi;



    private Boolean vaiTro;





    private String cccd;


    private Boolean trangThai;
}
