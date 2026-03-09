
package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class KhuyenMaiDTO {
    private Integer id;

    private String tenKhuyenMai;

    private float giaTri;

    private LocalDateTime ngayBatDau;

    private LocalDateTime ngayKetThuc;

    private int trangThai;
}
