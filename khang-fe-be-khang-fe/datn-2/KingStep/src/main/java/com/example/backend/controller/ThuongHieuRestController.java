package com.example.backend.controller;



import com.example.backend.entity.ThuongHieu;


import com.example.backend.service.ThuongHieuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/thuong-hieu")
public class ThuongHieuRestController {

    @Autowired
    private ThuongHieuService thuongHieuService;

    @GetMapping("/getAll")
    public List<ThuongHieu> getAll() {
        return thuongHieuService.getAll();
    }
    @GetMapping("/getAllFull")
    public List<ThuongHieu> getAllFull() {
        return thuongHieuService.getAllFull();
    }

    @GetMapping("/getById/{id}")
    public ThuongHieu getById(@PathVariable Integer id) {
        return thuongHieuService.getById(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@RequestBody ThuongHieu thuongHieu) {
        return thuongHieuService.create(thuongHieu);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody ThuongHieu thuongHieu) {
        return thuongHieuService.update(id, thuongHieu);
    }
    @PutMapping("/khoi-phuc/{id}")
    public ResponseEntity<?> khoiPhucThuongHieu(@PathVariable Integer id) {
        thuongHieuService.khoiPhucThuongHieu(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return thuongHieuService.delete(id);
    }

    @GetMapping("/getThungRac")
    public List<ThuongHieu> getThungRac() {
        return thuongHieuService.getThungRac();
    }
}

