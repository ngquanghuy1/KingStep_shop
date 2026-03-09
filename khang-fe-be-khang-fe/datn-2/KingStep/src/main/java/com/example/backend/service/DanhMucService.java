
package com.example.backend.service;



import com.example.backend.entity.DanhMuc;
import com.example.backend.entity.KichThuoc;
import com.example.backend.repository.DanhMucInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DanhMucService {

    @Autowired
    private DanhMucInterface dmi;

    public List<DanhMuc> getAll() {
        return dmi.findAllByTrangThai(1);
    }
    public List<DanhMuc> getAllFull() {
        return dmi.findAll();
    }
    public DanhMuc getById(Integer id) {
        return dmi.findById(id).orElse(null);
    }

    public ResponseEntity<?> create(DanhMuc danhMuc) {
        Optional<DanhMuc> existing = dmi.findByTenDanhMucIgnoreCase(danhMuc.getTenDanhMuc());
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Danh mục đã tồn tại!");
        }

        DanhMuc newDanhMuc = dmi.save(danhMuc);
        return ResponseEntity.status(HttpStatus.CREATED).body(newDanhMuc);
    }

    public ResponseEntity<?> update(Integer id, DanhMuc danhMuc) {
        Optional<DanhMuc> current = dmi.findById(id);
        if (current.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy Danh mục với ID: " + id);
        }

        Optional<DanhMuc> existing = dmi.findByTenDanhMucIgnoreCase(danhMuc.getTenDanhMuc());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Tên danh mục đã tồn tại!");
        }

        danhMuc.setId(id); // Cập nhật lại ID
        DanhMuc updated = dmi.save(danhMuc);
        return ResponseEntity.ok(updated);
    }

    public ResponseEntity<?> delete(Integer id) {
        Optional<DanhMuc> optionalDanhMuc = dmi.findById(id);
        if (optionalDanhMuc.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Danh mục với ID " + id + " không tìm thấy");
        }

        DanhMuc danhMuc = optionalDanhMuc.get();
        danhMuc.setTrangThai(0);
        DanhMuc saved = dmi.save(danhMuc);
        return ResponseEntity.ok(saved);
    }
    public void khoiPhucDanhMuc(Integer id) {
        DanhMuc dm = dmi.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu!"));
        dm.setTrangThai(1); // 1 = Đang hoạt động
        dmi.save(dm);
    }

    public List<DanhMuc> getThungRac() {
        return dmi.findAllByTrangThai(0);
    }
}

