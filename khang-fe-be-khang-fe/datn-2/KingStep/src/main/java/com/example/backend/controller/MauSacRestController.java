package com.example.backend.controller;



import com.example.backend.entity.MauSac;

import com.example.backend.service.MauSacService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/mau-sac")
public class MauSacRestController {

    @Autowired
    private MauSacService mauSacService;

    @GetMapping("/getAll")
    public List<MauSac> getAll() {
        return mauSacService.getAll();
    }
    @GetMapping("/getAllFull")
    public List<MauSac> getAllFull() {
        return mauSacService.getAllFull();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return mauSacService.getById(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@RequestBody MauSac mauSac) {
        return mauSacService.create(mauSac);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody MauSac mauSac) {
        return mauSacService.update(id, mauSac);
    }
    @PutMapping("/khoi-phuc/{id}")
    public ResponseEntity<?> khoiPhucMauSac(@PathVariable Integer id) {
        mauSacService.khoiPhucMauSac(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return mauSacService.delete(id);
    }

    @GetMapping("/getThungRac")
    public List<MauSac> getThungRac() {
        return mauSacService.getThungRac();
    }
}
