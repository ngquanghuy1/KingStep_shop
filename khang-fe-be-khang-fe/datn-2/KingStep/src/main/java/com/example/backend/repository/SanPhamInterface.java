package com.example.backend.repository;

import com.example.backend.dto.DonHangChiTietDTO;
import com.example.backend.dto.SanPhanDTO;
import com.example.backend.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SanPhamInterface extends JpaRepository<SanPham,Integer> {
    List<SanPham> findAllByTrangThai(int trangThai);
    Optional<SanPham> findByTenSanPhamIgnoreCase(String maSanPham);
    List<SanPham> findByTenSanPhamAndDanhMuc_IdAndThuongHieu_IdAndChatLieu_IdAndXuatXu_Id(
            String tenSanPham,
            Integer idDanhMuc,
            Integer idThuongHieu,
            Integer idChatLieu,
            Integer idXuatXu
    );
    List<SanPham> findByDanhMuc_IdAndThuongHieu_IdAndChatLieu_IdAndXuatXu_Id(
            Integer idDanhMuc, Integer idThuongHieu, Integer idChatLieu, Integer idXuatXu
    );
//    List<SanPham> findByDanhMuc_Id(Integer danhMucId);
//    List<SanPham> findByThuongHieu_Id(Integer thuongHieuId);
//    List<SanPham> findByChatLieu_Id(Integer thuongHieuId);
//    List<SanPham> findByXuatXu_Id(Integer thuongHieuId);
    @Query("""
        SELECT s FROM SanPham s
        WHERE (:idDanhMuc IS NULL OR s.danhMuc.id = :idDanhMuc)
          AND (:idThuongHieu IS NULL OR s.thuongHieu.id = :idThuongHieu)
          AND (:idChatLieu IS NULL OR s.chatLieu.id = :idChatLieu)
          AND (:idXuatXu IS NULL OR s.xuatXu.id = :idXuatXu)
          AND (:trangThai IS NULL OR s.trangThai = :trangThai)
    """)
    List<SanPham> filterSanPham(
            @Param("idDanhMuc") Integer idDanhMuc,
            @Param("idThuongHieu") Integer idThuongHieu,
            @Param("idChatLieu") Integer idChatLieu,
            @Param("idXuatXu") Integer idXuatXu,
            @Param("trangThai") Integer trangThai
    );


}
