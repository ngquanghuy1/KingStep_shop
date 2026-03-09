package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.sql.Date;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="KhuyenMai")

public class KhuyenMai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="TenKhuyenMai" ,unique = true)
    private String tenKhuyenMai;

    @Column(name="GiaTri")
    private Float giaTri;


    @Column(name="NgayBatDau")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.sss")
    private LocalDateTime ngayBatDau;


    @Column(name="NgayKetThuc")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.sss")
    private LocalDateTime ngayKetThuc;

    @Column(name="TrangThai")
    private Integer trangThai;

}
