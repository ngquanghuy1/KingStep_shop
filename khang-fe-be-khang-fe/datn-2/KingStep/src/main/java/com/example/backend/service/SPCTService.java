
package com.example.backend.service;

import com.example.backend.dto.SPCTDTO;

import com.example.backend.dto.SPCTRequest;
import com.example.backend.dto.SanPhamDonHangResponse;
import com.example.backend.entity.*;

import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SPCTService {

    @Autowired
    private SanPhamChiTietRepository spcti;


    @Autowired
    private SanPhamInterface spi;

    @Autowired
    private KichThuocInterface kti;

    @Autowired
    private MauSacInterface msi;

    @Autowired
    private KhuyenMaiRepository khuyenMaiRepository;

    @Autowired
    private KhuyenMaiService khuyenMaiService;

    public SanPhamChiTiet createSanPhamChiTiet(Integer id, SPCTRequest request) {
        request.setIdSanPham(id);

        // Kiểm tra trùng biến thể
        boolean exists = spcti.existsBySanPham_IdAndMauSac_IdAndKichThuoc_Id(
                id, request.getIdMauSac(), request.getIdKichThuoc()
        );
        if (exists) {
            throw new RuntimeException("Biến thể với màu sắc và kích thước này đã tồn tại!");
        }

        SanPham sanPham = spi.findById(request.getIdSanPham())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        KichThuoc kichThuoc = kti.findById(request.getIdKichThuoc())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kích thước"));

        MauSac mauSac = msi.findById(request.getIdMauSac())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy màu sắc"));

        SanPhamChiTiet spct = new SanPhamChiTiet();
        spct.setSanPham(sanPham);
        spct.setKichThuoc(kichThuoc);
        spct.setMauSac(mauSac);
        spct.setSoLuong(request.getSoLuong());
        spct.setGiaBan(request.getGiaBan());
        spct.setNgaySanXuat((Date) request.getNgaySanXuat());
        spct.setNgayTao(LocalDateTime.now());
        spct.setTrangThai(1); // mặc định còn bán

        return spcti.save(spct);
    }
    public SanPhamChiTiet updateSanPhamChiTiet(Integer idSpct, SPCTRequest request) {
        // Tìm biến thể cũ
        SanPhamChiTiet spct = spcti.findById(idSpct)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm"));

        // Lấy id sản phẩm, id màu sắc, id kích thước mới (ưu tiên giá trị mới, nếu không có thì lấy từ spct cũ)
        Integer idSanPham = request.getIdSanPham() != null ? request.getIdSanPham() : spct.getSanPham().getId();
        Integer idMauSac = request.getIdMauSac() != null ? request.getIdMauSac() : spct.getMauSac().getId();
        Integer idKichThuoc = request.getIdKichThuoc() != null ? request.getIdKichThuoc() : spct.getKichThuoc().getId();

        // Kiểm tra trùng biến thể (trừ chính nó)
        boolean exists = spcti.existsBySanPham_IdAndMauSac_IdAndKichThuoc_IdAndIdNot(
                idSanPham, idMauSac, idKichThuoc, idSpct
        );
        if (exists) {
            throw new RuntimeException("Biến thể này đã tồn tại!");
        }

        // Nếu muốn cho phép sửa các trường này:
        if (request.getIdSanPham() != null) {
            SanPham sanPham = spi.findById(request.getIdSanPham())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            spct.setSanPham(sanPham);
        }
        if (request.getIdKichThuoc() != null) {
            KichThuoc kichThuoc = kti.findById(request.getIdKichThuoc())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kích thước"));
            spct.setKichThuoc(kichThuoc);
        }
        if (request.getIdMauSac() != null) {
            MauSac mauSac = msi.findById(request.getIdMauSac())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy màu sắc"));
            spct.setMauSac(mauSac);
        }
        if (request.getSoLuong() != null) {
            spct.setSoLuong(request.getSoLuong());
        }
        if (request.getGiaBan() != null) {
            spct.setGiaBan(request.getGiaBan());
        }
        if (request.getNgaySanXuat() != null) {
            spct.setNgaySanXuat((Date) request.getNgaySanXuat());
        }

        return spcti.save(spct);
    }
    public List<SanPhamChiTiet> getAll() {
        return spcti.findAll();
    }


    public List<SPCTDTO> getAllForOffline() {
        return spcti.getAllSPCTDTO();
    }

    public List<SanPhamDonHangResponse> getSanPhamByDonHang(Integer idDonHang) {
        return spcti.getSanPhamByDonHang(idDonHang);
    }

    public List<SanPhamChiTiet> addSanPhamDuocKhuyenMai(Integer idKhuyenMai, List<Integer> listIdSanPham) {
        KhuyenMai khuyenMai = khuyenMaiRepository.findById(idKhuyenMai)
                .orElseThrow(() -> new IllegalArgumentException("Khuyến mãi không tồn tại"));

        List<SanPhamChiTiet> danhSachSanPham = spcti.findAllById(listIdSanPham);

        for (SanPhamChiTiet sp : danhSachSanPham) {
            sp.setKhuyenMai(khuyenMai);
        }

        khuyenMaiService.capNhatGiaKhuyenMaiChoDanhSach(danhSachSanPham);

        return spcti.saveAll(danhSachSanPham);
    }

    public List<SanPhamChiTiet> getSPCTDTOById(Integer id) {
        return spcti.findBySanPham_Id(id);
    }
    public SPCTDTO getSPCTDTOByIdSPCT(Integer id) {
        return spcti.getSPCTDTOById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm chi tiết"));
    }
    public List<SanPhamChiTiet> getThungrac(Integer id) {
        return spcti.findBySanPham_IdAndTrangThai(id,0);
    }
    public List<SPCTDTO> searchByTenSanPham(String keyword) {
        return spcti.searchByTenSanPham(keyword);
    }
    public List<SanPhamChiTiet> filterSPCT(Integer sanPhamId, Integer mauSacId, Integer kichThuocId, Integer trangThai) {
        return spcti.filterSPCT(sanPhamId, mauSacId, kichThuocId, trangThai);
    }

    public SanPhamChiTiet findById(Integer id) {
        return spcti.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm chi tiết"));
    }
    public void khoi_phuc(Integer id) {
        Optional<SanPhamChiTiet> optional = spcti.findById(id);
        if (optional.isPresent()) {
            SanPhamChiTiet spct = optional.get();
            spct.setTrangThai(1); // 1 = đang bán, 0 = đã xóa
            spcti.save(spct);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
    }
    public void xoa_mem(Integer id) {
        Optional<SanPhamChiTiet> optional = spcti.findById(id);
        if (optional.isPresent()) {
            SanPhamChiTiet spct = optional.get();
            spct.setTrangThai(0); // 1 = đang bán, 0 = đã xóa
            spcti.save(spct);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
    }
    public SanPhamChiTiet create(SanPhamChiTiet s) {
        s.setNgayTao(LocalDateTime.now());
        return spcti.save(s);
    }

    public SanPhamChiTiet update(Integer id, SanPhamChiTiet s) {
        SanPhamChiTiet old = spcti.getById(id);
        s.setId(old.getId());
        return spcti.save(s);
    }

    public void delete(Integer id) {
        spcti.deleteById(id);
    }








}
