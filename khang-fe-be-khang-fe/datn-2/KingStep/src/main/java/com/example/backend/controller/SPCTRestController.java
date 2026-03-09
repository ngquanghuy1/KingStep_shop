package com.example.backend.controller;


import com.example.backend.dto.SPCTDTO;
import com.example.backend.dto.SPCTRequest;
import com.example.backend.entity.SanPhamChiTiet;


import com.example.backend.service.SPCTService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/san-pham-chi-tiet")
public class SPCTRestController {

    @Autowired
    private SPCTService service;

    @GetMapping("/getAll")

    public ResponseEntity<List<SPCTDTO>> getAllForOffline() {
        return ResponseEntity.ok(service.getAllForOffline());
    }

    // tìm theo id sản phẩm
    @GetMapping("/{id}")
    public ResponseEntity<List<SanPhamChiTiet> > getSPCTDTOById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getSPCTDTOById(id));
    }

    //tìm theo id spct
    @GetMapping("spct/{id}")
    public ResponseEntity<SPCTDTO> getSPCTById(@PathVariable Integer id) {
        SPCTDTO dto = service.getSPCTDTOByIdSPCT(id);
        return ResponseEntity.ok(dto);
    }
    @GetMapping("thung-rac/{id}")
    public ResponseEntity<List<SanPhamChiTiet> > getThungrac(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getThungrac(id));
    }



    @GetMapping("/search")
    public ResponseEntity<List<SPCTDTO>> getByTen(@RequestParam String keyword) {
        return ResponseEntity.ok(service.searchByTenSanPham(keyword));

    }
    @GetMapping("/bo-loc")
    public ResponseEntity<List<SanPhamChiTiet>> filterSPCT(
            @RequestParam Integer sanPhamId,
            @RequestParam(required = false) Integer mauSacId,
            @RequestParam(required = false) Integer kichThuocId,
            @RequestParam(required = false) Integer trangThai
    ) {
        return ResponseEntity.ok(service.filterSPCT(sanPhamId, mauSacId, kichThuocId, trangThai));
    }

    @PostMapping("/them/{idSanPham}")
    public ResponseEntity<?> themBienThe(
            @PathVariable Integer idSanPham,
            @RequestBody SPCTRequest request) {
        try {
            SanPhamChiTiet spct = service.createSanPhamChiTiet(idSanPham, request);
            return ResponseEntity.ok(spct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/add")
    public ResponseEntity<SanPhamChiTiet> create(@RequestBody @Valid SanPhamChiTiet s) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(s));
    }
    @PutMapping("/sua/{idSpct}")
    public ResponseEntity<?> suaBienThe(
            @PathVariable Integer idSpct,
            @RequestBody SPCTRequest request) {
        try {
            SanPhamChiTiet spct = service.updateSanPhamChiTiet(idSpct, request);
            return ResponseEntity.ok(spct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<SanPhamChiTiet> update(@PathVariable Integer id,
                                                 @RequestBody @Valid SanPhamChiTiet s) {
        return ResponseEntity.ok(service.update(id, s));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("khoi-phuc/{id}")
    public ResponseEntity<?> restoreSanPham(@PathVariable Integer id) {
        try {
            service.khoi_phuc(id);
            return ResponseEntity.ok("Khôi phục thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Khôi phục thất bại");
        }
    }
    @PutMapping("xoa/{id}")
    public ResponseEntity<?> deleteSanPham(@PathVariable Integer id) {
        try {
            service.xoa_mem(id);
            return ResponseEntity.ok("chuyển vào thùng rác thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("chuyển vào thùng rác thất bại");
        }
    }
}

