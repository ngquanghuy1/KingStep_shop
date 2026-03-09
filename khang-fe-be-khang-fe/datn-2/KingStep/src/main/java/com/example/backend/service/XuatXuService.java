
package com.example.backend.service;



import com.example.backend.entity.KichThuoc;
import com.example.backend.entity.XuatXu;
import com.example.backend.repository.XuatXuInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class XuatXuService {

    @Autowired
    private XuatXuInterface xuatXuRepo;

    public List<XuatXu> getAllActive() {
        return xuatXuRepo.findAllByTrangThai(1);
    }
    public List<XuatXu> getAllFull() {
        return xuatXuRepo.findAll();
    }

    public XuatXu getById(Integer id) {
        return xuatXuRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy Xuất xứ với ID: " + id));
    }

    public ResponseEntity<?> create(XuatXu xuatXu) {
        Optional<XuatXu> existing = xuatXuRepo.findByTenXuatXuIgnoreCase(xuatXu.getTenXuatXu());
        if (existing.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Xuất xứ đã tồn tại!");
        }
        XuatXu newXuatXu = xuatXuRepo.save(xuatXu);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(newXuatXu);
    }

    public ResponseEntity<?> update(Integer id, XuatXu xuatXu) {
        Optional<XuatXu> current = xuatXuRepo.findById(id);
        if (current.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy Xuất xứ với ID: " + id);
        }

        Optional<XuatXu> existing = xuatXuRepo.findByTenXuatXuIgnoreCase(xuatXu.getTenXuatXu());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Tên xuất xứ đã tồn tại!");
        }

        // Cập nhật thông tin
        XuatXu xuatXuToUpdate = current.get();
        xuatXuToUpdate.setTenXuatXu(xuatXu.getTenXuatXu());
        xuatXuToUpdate.setTrangThai(xuatXu.getTrangThai());

        XuatXu updated = xuatXuRepo.save(xuatXuToUpdate);
        return ResponseEntity.ok(updated);
    }


    public ResponseEntity<?> delete(Integer id) {
        Optional<XuatXu> optional = xuatXuRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Xuất xứ với ID " + id + " không tìm thấy");
        }

        XuatXu xuatXu = optional.get();
        xuatXu.setTrangThai(0);
        XuatXu saved = xuatXuRepo.save(xuatXu);
        return ResponseEntity.ok(saved);
    }
    public void khoiPhucXuatXu(Integer id) {
        XuatXu xx = xuatXuRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu!"));
        xx.setTrangThai(1); // 1 = Đang hoạt động
        xuatXuRepo.save(xx);
    }

    public List<XuatXu> getThungRac() {
        return xuatXuRepo.findAllByTrangThai(0);
    }
}

