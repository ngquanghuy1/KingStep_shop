package com.example.backend.controller;




import com.example.backend.dto.NhanVienDTO;
import com.example.backend.service.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NhanVienController {

    @Autowired
    private NhanVienService nhanVienService;

    @GetMapping("/nhanvien")
    public ResponseEntity<List<NhanVienDTO>> getall(){
        return ResponseEntity.ok(nhanVienService.findall());
    }

    @GetMapping("/nhanvien/{id}")
    public ResponseEntity<NhanVienDTO> getbyid(@PathVariable Integer id){
        return ResponseEntity.ok(nhanVienService.findById(id));
    }

    @PostMapping("/nhanvien/create")
    public ResponseEntity<NhanVienDTO> create(@RequestBody NhanVienDTO nhanVienDTO){
        NhanVienDTO dto = nhanVienService.create(nhanVienDTO);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/nhanvien/update/{id}")
    public ResponseEntity<NhanVienDTO> update(@PathVariable int id, @RequestBody NhanVienDTO dto) {
        return ResponseEntity.ok(nhanVienService.update(id,dto));
    }

    @DeleteMapping("/nhanvien/delete/{id}")
    public Boolean delete(@PathVariable int id){
        return nhanVienService.delete(id);
    }
}
