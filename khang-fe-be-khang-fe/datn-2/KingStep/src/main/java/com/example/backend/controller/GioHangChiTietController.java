package com.example.backend.controller;


import com.example.backend.dto.ThemGioHangDTO;
import com.example.backend.entity.GioHangChiTiet;
import com.example.backend.service.GioHangChiTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gio-hang-chi-tiet")
public class GioHangChiTietController {

    @Autowired
    private GioHangChiTietService gioHangChiTietService;



    // Thêm sản phẩm vào giỏ hàng
    @PostMapping("/them")
    public ResponseEntity<GioHangChiTiet> themVaoGio(@RequestBody ThemGioHangDTO req) {
        return ResponseEntity.ok(gioHangChiTietService.themVaoGio(req));
    }
    @GetMapping("/{idKhachHang}")
    public ResponseEntity<List<GioHangChiTiet>> layDanhSachTheoKhach(@PathVariable Integer idKhachHang) {
        return ResponseEntity.ok(gioHangChiTietService.getDanhSachTheoKhach(idKhachHang));
    }

    @PutMapping("/cap-nhat")
    public ResponseEntity<GioHangChiTiet> capNhatSoLuong(@RequestParam Integer id, @RequestParam int soLuongMoi) {
        GioHangChiTiet capNhat = gioHangChiTietService.capNhatSoLuong(id, soLuongMoi);
        return ResponseEntity.ok(capNhat);
    }

    @DeleteMapping("/xoa-tat-ca/{idKhach}")
    public ResponseEntity<Void> xoaHetTheoKhach(@PathVariable Integer idKhach) {
        gioHangChiTietService.xoaTatCaTheoKhach(idKhach);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/so-loai/{idKhach}")
    public ResponseEntity<Integer> soLoai(@PathVariable Integer idKhach) {
        int count = gioHangChiTietService.soLoaiSanPham(idKhach);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/tong-so-luong/{idKhachHang}")
    public ResponseEntity<Integer> tongSoLuong(@PathVariable Integer idKhachHang) {
        return ResponseEntity.ok(gioHangChiTietService.tongSoLuong(idKhachHang));
    }

    @GetMapping("/tong-tien/{idKhachHang}")
    public ResponseEntity<Double> tongTien(@PathVariable Integer idKhachHang) {
        return ResponseEntity.ok(gioHangChiTietService.tongTien(idKhachHang));
    }

}
