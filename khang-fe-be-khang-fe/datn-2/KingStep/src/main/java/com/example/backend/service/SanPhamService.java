
package com.example.backend.service;


import com.example.backend.dto.DonHangChiTietDTO;
import com.example.backend.dto.SanPhanDTO;
import com.example.backend.entity.SanPham;
import com.example.backend.repository.SanPhamInterface;
import com.example.backend.ThongBao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class SanPhamService {

    @Autowired
    private SanPhamInterface sanPhamRepo;

    public List<SanPham> getAllActive() {
        return sanPhamRepo.findAll();
    }

    public SanPham getById(Integer id) {
        return sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
    }
//    public List<SanPham> getSanPhamById(Integer id) {
//        return sanPhamRepo.findByDanhMuc_Id(id);
//    }
//    public List<SanPham> getThuongHieuById(Integer id) {
//        return sanPhamRepo.findByThuongHieu_Id(id);
//    }
//    public List<SanPham> getChatLieuById(Integer id) {
//        return sanPhamRepo.findByChatLieu_Id(id);
//    }
//    public List<SanPham> getXuatXuById(Integer id) {
//        return sanPhamRepo.findByXuatXu_Id(id);
//    }
    public List<SanPham> filterSanPham(Integer idDanhMuc, Integer idThuongHieu, Integer idChatLieu, Integer idXuatXu ,Integer trangThai) {
        return sanPhamRepo.filterSanPham(idDanhMuc, idThuongHieu, idChatLieu, idXuatXu , trangThai);
    }

    public SanPham create(SanPham sanPham) {
        Optional<SanPham> existing = sanPhamRepo.findByTenSanPhamIgnoreCase(sanPham.getTenSanPham());
        if (existing.isPresent()) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại!");
        }
        sanPham.setTrangThai(1);
        return sanPhamRepo.save(sanPham);
    }

    public SanPham update(Integer id, SanPham sanPham) {
        SanPham current = sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));

        Optional<SanPham> existing = sanPhamRepo.findByTenSanPhamIgnoreCase(sanPham.getTenSanPham());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại!");
        }

        sanPham.setId(id); // Gán id vào entity
        return sanPhamRepo.save(sanPham);
    }

    public void delete(Integer id) {
        SanPham sanPham = sanPhamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        sanPham.setTrangThai(0);
        sanPhamRepo.save(sanPham);
    }
    public void restoreSanPham(Integer id) {
        Optional<SanPham> optional = sanPhamRepo.findById(id);
        if (optional.isPresent()) {
            SanPham sp = optional.get();
            sp.setTrangThai(1); // 1 = đang bán, 0 = đã xóa
            sanPhamRepo.save(sp);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
    }

    public List<SanPham> getDeleted() {
        return sanPhamRepo.findAllByTrangThai(0);
    }










}

