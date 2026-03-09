package com.example.backend.controller;


import com.example.backend.entity.DanhMuc;

import com.example.backend.service.DanhMucService;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc")


public class DanhMucRestController {

    @Autowired
    private DanhMucService danhMucService;

    @GetMapping("/getAll")
    public List<DanhMuc> getAll() {
        return danhMucService.getAll();
    }

    @GetMapping("/getAllFull")
    public List<DanhMuc> getAllFull() {
        return danhMucService.getAllFull();
    }

    @GetMapping("/getById/{id}")
    public DanhMuc getById(@PathVariable Integer id) {
        return danhMucService.getById(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@RequestBody DanhMuc danhMuc) {
        return danhMucService.create(danhMuc);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody DanhMuc danhMuc) {
        return danhMucService.update(id, danhMuc);
    }
    @PutMapping("/khoi-phuc/{id}")
    public ResponseEntity<?> khoiPhucDanhMuc(@PathVariable Integer id) {
        danhMucService.khoiPhucDanhMuc(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return danhMucService.delete(id);
    }

    @GetMapping("/getThungRac")
    public List<DanhMuc> getThungRac() {
        return danhMucService.getThungRac();
    }
}

