
package com.example.backend.service;


import com.example.backend.dto.KhuyenMaiDTO;
import com.example.backend.entity.KhuyenMai;

import com.example.backend.entity.SanPhamChiTiet;
import com.example.backend.repository.KhuyenMaiRepository;
import com.example.backend.repository.SanPhamChiTietRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class KhuyenMaiService {

    @Autowired
    private KhuyenMaiRepository khuyenMaiRepository;

    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;

    public KhuyenMaiDTO convertDTO(KhuyenMai km) {
        return new KhuyenMaiDTO(
                km.getId(),
                km.getTenKhuyenMai(),
                km.getGiaTri(),
                km.getNgayBatDau(),
                km.getNgayKetThuc(),
                km.getTrangThai()
        );
    }

    // ham lay all khuyen mai
    public List<KhuyenMaiDTO> getall() {
        return khuyenMaiRepository.findAll().stream()
                .map(khuyenMai -> new KhuyenMaiDTO(
                        khuyenMai.getId(),
                        khuyenMai.getTenKhuyenMai(),
                        khuyenMai.getGiaTri(),
                        khuyenMai.getNgayBatDau(),
                        khuyenMai.getNgayKetThuc(),
                        khuyenMai.getTrangThai()
                )).toList();
    }

    //ham lay danh sach theo id
    public KhuyenMaiDTO findById(Integer id) {
        return khuyenMaiRepository.findById(id)
                .map(khuyenMai -> new KhuyenMaiDTO(
                        khuyenMai.getId(),
                        khuyenMai.getTenKhuyenMai(),
                        khuyenMai.getGiaTri(),
                        khuyenMai.getNgayBatDau(),
                        khuyenMai.getNgayKetThuc(),
                        khuyenMai.getTrangThai()
                ))
                .orElse(null);
    }

    // ham create khuyenmai
    public KhuyenMaiDTO create(KhuyenMaiDTO dto) {
        KhuyenMai km = new KhuyenMai();
        km.setTenKhuyenMai(dto.getTenKhuyenMai());
        km.setGiaTri(dto.getGiaTri());
        km.setNgayBatDau(dto.getNgayBatDau());
        km.setNgayKetThuc(dto.getNgayKetThuc());
        km.setTrangThai(dto.getTrangThai());

        return convertDTO(khuyenMaiRepository.save(km));

    }

    public boolean delete(Integer id) {
        if (khuyenMaiRepository.existsById(id)) {
            khuyenMaiRepository.deleteById(id);
            return true;
        }
        return false;
    }

    //ham update khuyen mai
    public KhuyenMaiDTO update(int id, KhuyenMaiDTO dto) {
        return khuyenMaiRepository.findById(id)
                .map(km -> {
                    km.setTenKhuyenMai(dto.getTenKhuyenMai());
                    km.setGiaTri(dto.getGiaTri());
                    km.setNgayBatDau(dto.getNgayBatDau());
                    km.setNgayKetThuc(dto.getNgayKetThuc());
                    km.setTrangThai(dto.getTrangThai());

                    return convertDTO(khuyenMaiRepository.save(km));
                })
                .orElse(null);
    }

    public KhuyenMai tatKhuyenMai(int id) {
        LocalDateTime now = LocalDateTime.now();
        Optional<KhuyenMai> khuyenMai = khuyenMaiRepository.findById(id);
        khuyenMai.get().setTrangThai(0);
        khuyenMai.get().setNgayKetThuc(now);

        KhuyenMai km = khuyenMai.get();

        return khuyenMaiRepository.save(km);
    }

    public void capNhatGiaKhuyenMaiChoDanhSach(List<SanPhamChiTiet> danhSachSanPham) {
        LocalDateTime now = LocalDateTime.now();

        for (SanPhamChiTiet sp : danhSachSanPham) {
            KhuyenMai km = sp.getKhuyenMai();
            if (km != null &&
                    km.getTrangThai() == 1 &&
                    now.isAfter(km.getNgayBatDau()) &&
                    now.isBefore(km.getNgayKetThuc())) {

                Float giaTri = km.getGiaTri();
                if (giaTri != null && giaTri > 0) {
                    double giamGia = sp.getGiaBan() * giaTri / 100.0;
                    sp.setGiaBanGiamGia(sp.getGiaBan() - giamGia);
                    continue;
                }
            }

            // Không có khuyến mãi hợp lệ
            sp.setGiaBanGiamGia(sp.getGiaBan());
        }
    }

    @Scheduled(fixedRate = 6000000) // Cập nhật mỗi 60 giây
    public void updateActiveKhuyenMai() {
        updateKhuyenMaiActive();
    }

    /**
     * Cập nhật trạng thái khuyến mãi:
     * - Nếu đã hết hạn: gỡ khỏi sản phẩm, trạng thái = 0
     * - Nếu đang hoạt động: trạng thái = 1
     * - Nếu chưa bắt đầu hoặc hết hạn: trạng thái = 0
     */
    @Transactional
    public void updateKhuyenMaiActive() {
        LocalDateTime now = LocalDateTime.now();

        List<KhuyenMai> khuyenMaiList = khuyenMaiRepository.findAll();
        List<KhuyenMai> khuyenMaiCapNhat = new ArrayList<>();
        List<SanPhamChiTiet> sanPhamChiTietCapNhat = new ArrayList<>();

        for (KhuyenMai km : khuyenMaiList) {
            boolean isExpired = km.getNgayKetThuc().isBefore(now);
            boolean isActive = km.getNgayBatDau().isBefore(now) && km.getNgayKetThuc().isAfter(now);

            List<SanPhamChiTiet> chiTietList = sanPhamChiTietRepository.findByKhuyenMai_Id((km.getId()));

            if (isExpired) {
                // HẾT HẠN → Gỡ khỏi sản phẩm + cập nhật trạng thái KM
                for (SanPhamChiTiet ct : chiTietList) {
                    ct.setKhuyenMai(null);
                    ct.setGiaBanGiamGia(ct.getGiaBan());
                    sanPhamChiTietCapNhat.add(ct);
                }
                if (km.getTrangThai() != 0) {
                    km.setTrangThai(0);
                    khuyenMaiCapNhat.add(km);
                }

            } else if (isActive) {
                // ĐANG HIỆU LỰC
                if (chiTietList.isEmpty()) {
                    // ⚠ Trường hợp khuyến mãi còn hiệu lực nhưng không có sản phẩm áp dụng → Tắt trạng thái
                    if (km.getTrangThai() != 0) {
                        km.setTrangThai(0);
                        khuyenMaiCapNhat.add(km);
                    }
                } else {
                    // Có sản phẩm áp dụng → Đảm bảo trạng thái = 1
                    if (km.getTrangThai() != 1) {
                        km.setTrangThai(1);
                        khuyenMaiCapNhat.add(km);
                    }
                }

            } else {
                // CHƯA ĐẾN hoặc KHÔNG HỢP LỆ
                if (km.getTrangThai() != 0) {
                    km.setTrangThai(0);
                    khuyenMaiCapNhat.add(km);
                }
            }
        }

        if (!sanPhamChiTietCapNhat.isEmpty()) {
            sanPhamChiTietRepository.saveAll(sanPhamChiTietCapNhat);
        }

        if (!khuyenMaiCapNhat.isEmpty()) {
            khuyenMaiRepository.saveAll(khuyenMaiCapNhat);
        }
    }
}
