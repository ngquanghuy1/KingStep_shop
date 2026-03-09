package com.example.backend.repository;

import com.example.backend.entity.DonHang;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Integer> {
//    List<DonHang> getAllByTrangThai(Integer id);
@Query("SELECT d FROM DonHang d WHERE (:trangThai IS NULL OR d.trangThai = :trangThai) AND (:loai IS NULL OR LOWER(d.loaiDonHang) LIKE LOWER(CONCAT('%', :loai, '%')))")
List<DonHang> findByTrangThaiAndLoaiDonHang(@Param("trangThai") Integer trangThai, @Param("loai") String loaiDonHang);

    List<DonHang> findByKhachHangIdOrderByNgayTaoDesc(Integer idKhachHang);

    // Dùng trong admin lọc đơn theo trạng thái
    List<DonHang> findByTrangThai(Integer trangThai);

    // Tổng doanh thu
    @Query("SELECT SUM(d.tongTien) FROM DonHang d")
    double sumTongTien();

    // Đếm đơn theo trạng thái
    int countByTrangThai(Integer trangThai);

    @EntityGraph(attributePaths = {"donHangChiTiets"})
    @Query("SELECT d FROM DonHang d WHERE d.id = :id")
    DonHang findWithChiTiet(@Param("id") Integer id);

    // Đếm đơn theo trạng thái
    List<DonHang> findAllByGiamGia_Id(Integer idVoucher);

}
