package com.example.backend.controller;


import com.example.backend.dto.DonHangChiTietDTO;
import com.example.backend.dto.SanPhanDTO;
import com.example.backend.entity.SanPham;

import com.example.backend.service.SanPhamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/san-pham")
public class SanPhamRestController {

    @Autowired
    private SanPhamService sanPhamService;

    @GetMapping("/getAll")
    public List<SanPham> getAllActive() {
        return sanPhamService.getAllActive();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(sanPhamService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
//    @GetMapping("/id-dm/{id}")
//    public ResponseEntity<List<SanPham>> getByIdDonHang(@PathVariable Integer id){
//        return ResponseEntity.ok(sanPhamService.getSanPhamById(id));
//    }
//    @GetMapping("/id-th/{id}")
//    public ResponseEntity<List<SanPham>> getByIdTH(@PathVariable Integer id){
//        return ResponseEntity.ok(sanPhamService.getThuongHieuById(id));
//    }
//    @GetMapping("/id-cl/{id}")
//    public ResponseEntity<List<SanPham>> getByIdCL(@PathVariable Integer id){
//        return ResponseEntity.ok(sanPhamService.getChatLieuById(id));
//    }
//    @GetMapping("/id-xx/{id}")
//    public ResponseEntity<List<SanPham>> getByIdXX(@PathVariable Integer id){
//        return ResponseEntity.ok(sanPhamService.getXuatXuById(id));
//    }
    @GetMapping("/bo-loc")
    public ResponseEntity<List<SanPham>> filterSanPham(
            @RequestParam(required = false) Integer idDanhMuc,
            @RequestParam(required = false) Integer idThuongHieu,
            @RequestParam(required = false) Integer idChatLieu,
            @RequestParam(required = false) Integer idXuatXu,
            @RequestParam(required = false) Integer trangThai
    ) {
        List<SanPham> result = sanPhamService.filterSanPham(idDanhMuc, idThuongHieu, idChatLieu, idXuatXu , trangThai);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@Valid @RequestBody SanPham sanPham) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(sanPhamService.create(sanPham));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody SanPham sanPham) {
        try {
            return ResponseEntity.ok(sanPhamService.update(id, sanPham));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            sanPhamService.delete(id);
            return ResponseEntity.ok("Đã chuyển sản phẩm vào thùng rác.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PutMapping("khoi-phuc/{id}")
    public ResponseEntity<?> restoreSanPham(@PathVariable Integer id) {
        try {
            sanPhamService.restoreSanPham(id);
            return ResponseEntity.ok("Khôi phục thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Khôi phục thất bại");
        }
    }

    @GetMapping("/thung-rac")
    public List<SanPham> getDeleted() {
        return sanPhamService.getDeleted();
    }


}


