package com.example.backend.controller;



import com.example.backend.dto.DonHangChiTietDTO;
import com.example.backend.dto.DonHangDTO;
import com.example.backend.entity.DonHang;
import com.example.backend.repository.DonHangRepository;
import com.example.backend.service.DonHangChiTietService;


import com.example.backend.service.DonHangService;
import com.example.backend.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api")
public class DonHangChiTietController {

    @Autowired
    private DonHangChiTietService chiTietService;
    @Autowired
    private DonHangService donHangService;

    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private VoucherService voucherService;

    @GetMapping("/donhangchitiet")
    public ResponseEntity<List<DonHangChiTietDTO>> getAll() {
        return ResponseEntity.ok(chiTietService.getAll());
    }

    @GetMapping("/donhangchitiet/{id}")
    public ResponseEntity<DonHangChiTietDTO> getById(@PathVariable int id) {
        DonHangChiTietDTO dto = chiTietService.getById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }
    @GetMapping("/donhangchitiet/don-hang/{id}")
    public ResponseEntity<List<DonHangChiTietDTO>> getByIdDonHang(@PathVariable Integer id){
        return ResponseEntity.ok(chiTietService.getDonHangById(id));
    }

    @PostMapping("/donhangchitiet/create")
    public ResponseEntity<DonHangChiTietDTO> create(@RequestBody DonHangChiTietDTO dto) {
        return ResponseEntity.ok(chiTietService.create(dto));
    }

    @PutMapping("/donhangchitiet/update/{id}")
    public ResponseEntity<DonHangChiTietDTO> update(@PathVariable int id, @RequestBody DonHangChiTietDTO dto) {
        DonHangChiTietDTO updated = chiTietService.update(id, dto);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/donhangchitiet/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        chiTietService.delete(id);
        return ResponseEntity.ok().build();
    }



    @GetMapping("/don-hang-chi-tiet")
    public ResponseEntity<List<DonHangDTO>> getAll2() {
        return ResponseEntity.ok(donHangService.getAll());
    }

    @GetMapping("/don-hang-chi-tiet/{id}")
    public ResponseEntity<DonHangDTO> getById(@PathVariable Integer id) {
        DonHangDTO dto = donHangService.getById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping("/don-hang-chi-tiet/create")
    public ResponseEntity<DonHangDTO> create2(@RequestBody DonHangDTO dto) {
        return ResponseEntity.ok(donHangService.create(dto));
    }

    @PutMapping("/don-hang-chi-tiet/update/{id}")
    public ResponseEntity<DonHangDTO> update2(@PathVariable Integer id, @RequestBody DonHangDTO dto) {
        DonHangDTO updated = donHangService.update(id, dto);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/don-hang-chi-tiet/delete/{id}")
    public ResponseEntity<Void> delete2(@PathVariable Integer id) {
        donHangService.delete(id);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/don-hang-chi-tiet/{idDonHang}/apply-voucher/{idVoucher}")
    public ResponseEntity<?> applyVoucherToDonHang(
            @PathVariable Integer idDonHang,
            @PathVariable Integer idVoucher
    ) {
        DonHang dh = donHangRepository.findById(idDonHang)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        try {
            voucherService.updateVoucherForDonHang(dh,idVoucher);
            donHangRepository.save(dh);

            return ResponseEntity.ok(dh);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/don-hang-chi-tiet/{idDonHang}/remove-voucher")
    public ResponseEntity<?> removeVoucherFromDonHang(@PathVariable Integer idDonHang) {
        DonHang dh = donHangRepository.findById(idDonHang)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        dh.setGiamGia(null);
        dh.setTongTienGiamGia(dh.getTongTien());

        donHangRepository.save(dh);

        return ResponseEntity.ok("Đã gỡ voucher khỏi đơn hàng");
    }
}
