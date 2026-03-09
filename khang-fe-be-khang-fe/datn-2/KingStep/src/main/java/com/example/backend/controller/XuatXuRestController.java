package com.example.backend.controller;



import com.example.backend.entity.XuatXu;

import com.example.backend.service.XuatXuService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;


@RestController
@RequestMapping("/api/xuat-xu")
public class XuatXuRestController {

    @Autowired
    private XuatXuService service;

    @GetMapping("/getAll")
    public List<XuatXu> getAll() {
        return service.getAllActive();
    }
    @GetMapping("/getAllFull")
    public List<XuatXu> getAllFull() {
        return service.getAllFull();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@RequestBody XuatXu xuatXu) {
        return service.create(xuatXu);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody XuatXu xuatXu) {
        return service.update(id, xuatXu);
    }
    @PutMapping("/khoi-phuc/{id}")
    public ResponseEntity<?> khoiPhucXuatXu(@PathVariable Integer id) {
        service.khoiPhucXuatXu(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return service.delete(id);
    }

    @GetMapping("/getThungRac")
    public List<XuatXu> getThungRac() {
        return service.getThungRac();
    }
}

