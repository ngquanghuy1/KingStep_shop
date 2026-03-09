package com.example.backend.controller;


import com.example.backend.dto.VoucherDTO;
import com.example.backend.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    @GetMapping("/voucher")
    public ResponseEntity<List<VoucherDTO>> getall(){
        return ResponseEntity.ok(voucherService.getall());

    }

    //hiển thị những voucher đủ điều kiện áp dụng cho đơn hàng
    @GetMapping("/voucher/available")
    public ResponseEntity<List<VoucherDTO>> getAvailableVouchers(@RequestParam Integer orderId) {
        return ResponseEntity.ok(voucherService.getAvailableVouchers(orderId));
    }

    @GetMapping("/voucher/{id}")
    public ResponseEntity<VoucherDTO> getbyid(@PathVariable Integer id){
        return ResponseEntity.ok(voucherService.findById(id));
    }

    @PostMapping("/voucher/create")
    public ResponseEntity<VoucherDTO> create(@RequestBody VoucherDTO voucherDTO){
        VoucherDTO dto = voucherService.create(voucherDTO);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/voucher/update/{id}")
    public ResponseEntity<VoucherDTO> update(@PathVariable int id, @RequestBody VoucherDTO dto) {
        return ResponseEntity.ok(voucherService.update(id,dto));
    }

    @DeleteMapping("/voucher/delete/{id}")
    public Boolean delete(@PathVariable int id){
        return voucherService.delete(id);
    }
}
