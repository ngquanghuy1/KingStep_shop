package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NhanVien")
public class NhanVien {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Tên nhân viên không được bỏ trống !")
    @Column(name = "TenNhanVien")
    private String tenNhanVien;

    @NotBlank(message = "Email không được bỏ trống !")
    @Email(message = "Email không hợp lệ !")
    @Column(unique = true, name = "Email")
    private String email;

    @Size(max = 10, message = "Số điện thoại không được dài quá 10 ký tự")
    @NotBlank(message = "Số điện thoại không được bỏ trống !")
    @Column(unique = true, name = "SoDienThoai")
    private String soDienThoai;

    @NotNull(message = "Ngày sinh không được bỏ trống !")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "NgaySinh")
    private LocalDate ngaySinh;

    @NotNull(message = "Giới tính không được bỏ trống !")
    @Column(name = "GioiTinh")
    private Boolean gioiTinh;

    @NotBlank(message = "Địa chỉ không được bỏ trống !")
    @Column(name = "DiaChi")
    private String diaChi;


    @Column(name = "VaiTro")
    private Boolean vaiTro;


    @Column(name = "MatKhau")
    private String matKhau;


    @Column(unique = true, name = "CCCD")
    private String cccd;

    @NotNull(message = "Trạng thái không được bỏ trống !")
    @Column(name = "TrangThai")
    private Boolean trangThai;
}
