package com.example.backend.controller;

import com.example.backend.entity.DiaChi;
import com.example.backend.entity.KhachHang;
import com.example.backend.repository.DiaChiRepository;
import com.example.backend.repository.KhachHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diachi")
@CrossOrigin
public class DiaChiController {

    private final DiaChiRepository diaChiRepository;
    private final KhachHangRepository khachHangRepository;

    public DiaChiController(DiaChiRepository diaChiRepository,
                            KhachHangRepository khachHangRepository) {
        this.diaChiRepository = diaChiRepository;
        this.khachHangRepository = khachHangRepository;
    }

    // ==============================
    // LẤY DANH SÁCH ĐỊA CHỈ
    // ==============================
    @GetMapping("/{idKhachHang}")
    public List<DiaChi> getDiaChiByKhachHang(@PathVariable Integer idKhachHang) {
        return diaChiRepository.findByKhachHang_Id(idKhachHang);
    }

    // ==============================
    // LẤY ĐỊA CHỈ MẶC ĐỊNH
    // ==============================
    @GetMapping("/mac-dinh/{idKhachHang}")
    public DiaChi getDiaChiMacDinh(@PathVariable Integer idKhachHang) {

        List<DiaChi> list = diaChiRepository.findByKhachHang_Id(idKhachHang);

        return list.stream()
                .filter(d -> Boolean.TRUE.equals(d.getMacDinh()))
                .findFirst()
                .orElse(null);
    }

    // ==============================
    // THÊM ĐỊA CHỈ
    // ==============================
    @PostMapping
    public DiaChi addDiaChi(@RequestBody DiaChi dc) {

        KhachHang kh = khachHangRepository
                .findById(dc.getKhachHang().getId())
                .orElseThrow();

        dc.setKhachHang(kh);

        return diaChiRepository.save(dc);
    }

    // ==============================
    // SỬA ĐỊA CHỈ
    // ==============================
    @PutMapping("/{id}")
    public DiaChi updateDiaChi(@PathVariable Integer id,
                               @RequestBody DiaChi dc) {

        DiaChi diaChi = diaChiRepository.findById(id).orElseThrow();

        diaChi.setTenNguoiNhan(dc.getTenNguoiNhan());
        diaChi.setSoDienThoai(dc.getSoDienThoai());
        diaChi.setTinhThanh(dc.getTinhThanh());
        diaChi.setQuanHuyen(dc.getQuanHuyen());
        diaChi.setPhuongXa(dc.getPhuongXa());
        diaChi.setDiaChiChiTiet(dc.getDiaChiChiTiet());

        return diaChiRepository.save(diaChi);
    }

    // ==============================
    // XÓA ĐỊA CHỈ
    // ==============================
    @DeleteMapping("/{id}")
    public void deleteDiaChi(@PathVariable Integer id) {

        diaChiRepository.deleteById(id);

    }

    // ==============================
    // ĐẶT ĐỊA CHỈ MẶC ĐỊNH
    // ==============================
    @PutMapping("/mac-dinh/{idDiaChi}")
    public DiaChi setMacDinh(@PathVariable Integer idDiaChi) {

        DiaChi diaChi = diaChiRepository.findById(idDiaChi).orElseThrow();

        Integer idKhachHang = diaChi.getKhachHang().getId();

        List<DiaChi> list = diaChiRepository.findByKhachHang_Id(idKhachHang);

        for (DiaChi dc : list) {
            dc.setMacDinh(false);
            diaChiRepository.save(dc);
        }

        diaChi.setMacDinh(true);

        return diaChiRepository.save(diaChi);
    }
}