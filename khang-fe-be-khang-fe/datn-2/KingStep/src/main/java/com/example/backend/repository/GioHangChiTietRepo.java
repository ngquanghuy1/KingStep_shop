package com.example.backend.repository;

import com.example.backend.entity.GioHangChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GioHangChiTietRepo extends JpaRepository<GioHangChiTiet,Integer> {

    @Query("SELECT COALESCE(SUM(g.soLuong),0) FROM GioHangChiTiet g WHERE g.khachHang.id = :id")
    int demTongSoLuongTrongGioKhach(@Param("id") Integer idKhach);

    @Query("SELECT COALESCE(SUM(g.soLuong * g.gia),0) FROM GioHangChiTiet g WHERE g.khachHang.id = :id")
    double tinhTongTienGioHang(@Param("id") Integer idKhach);
    GioHangChiTiet findBySanPhamChiTietIdAndKhachHangId(Integer idSpct, Integer idKhachHang);

    List<GioHangChiTiet> findByKhachHangId(Integer idKhachHang);
}
