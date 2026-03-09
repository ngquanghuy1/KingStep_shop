package com.example.backend.repository;


import com.example.backend.dto.SPCTDTO;
import com.example.backend.dto.SanPhamDonHangResponse;
import com.example.backend.entity.KichThuoc;
import com.example.backend.entity.SanPham;
import com.example.backend.entity.SanPhamChiTiet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface SanPhamChiTietRepository extends JpaRepository<SanPhamChiTiet,Integer> {
    @Query(
            """

                    SELECT new com.example.backend.dto.SPCTDTO(
                    spct.id,
                    sp.imanges,
                    sp.tenSanPham,
                    spct.soLuong,
                    spct.giaBan,
                    spct.giaBanGiamGia,
                    kt.tenKichThuoc,
                    ms.tenMauSac,
                    spct.khuyenMai.id 
                )
                FROM SanPhamChiTiet spct
                JOIN spct.sanPham sp
                JOIN spct.kichThuoc kt
                JOIN spct.mauSac ms
                WHERE sp.trangThai = 1
                          And spct.trangThai = 1
            """
    )
    List<SPCTDTO> getAllSPCTDTO();

    @Query(
            """
            SELECT new com.example.backend.dto.SPCTDTO(
                spct.id,
                sp.imanges,
                sp.tenSanPham,
                spct.soLuong,
                spct.giaBan,
                spct.giaBanGiamGia,
                kt.tenKichThuoc,
                ms.tenMauSac,
                spct.khuyenMai.id
            )
            FROM SanPhamChiTiet spct
            JOIN spct.sanPham sp
            JOIN spct.kichThuoc kt
            JOIN spct.mauSac ms
                    WHERE spct.id = :id
            """
    )
    Optional<SPCTDTO> getSPCTDTOById(Integer id);

    @Query(
            """
            SELECT new com.example.backend.dto.SanPhamDonHangResponse(
                sp.tenSanPham,
                kt.tenKichThuoc,
                ms.tenMauSac,
                dhct.soLuong,
                dhct.thanhTien
            )
            FROM DonHangChiTiet dhct
            JOIN dhct.sanPhamChiTiet spct
            JOIN spct.sanPham sp
            JOIN spct.kichThuoc kt
            JOIN spct.mauSac ms
            WHERE dhct.donHang.id = :idDonHang
            """
    )
    List<SanPhamDonHangResponse> getSanPhamByDonHang(@Param("idDonHang") Integer idDonHang);

    @Query(
            """
            SELECT new com.example.backend.dto.SPCTDTO(
                spct.id,
                sp.imanges,
                sp.tenSanPham,
                spct.soLuong,
                spct.giaBan,
                spct.giaBanGiamGia,
                kt.tenKichThuoc,
                ms.tenMauSac,
                spct.khuyenMai.id 
            )
            FROM SanPhamChiTiet spct
            JOIN spct.sanPham sp
            JOIN spct.kichThuoc kt
            JOIN spct.mauSac ms
            WHERE LOWER(sp.tenSanPham) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """
    )


    List<SPCTDTO> searchByTenSanPham(@Param("keyword") String keyword);

    List<SanPhamChiTiet> findBySanPham_IdAndTrangThai(Integer sanPhamId, Integer trangThai);
    List<SanPhamChiTiet> findBySanPham_Id(Integer sanPhamId);
    boolean existsBySanPham_IdAndMauSac_IdAndKichThuoc_Id(Integer idSanPham, Integer idMauSac, Integer idKichThuoc);
    boolean existsBySanPham_IdAndMauSac_IdAndKichThuoc_IdAndIdNot(
            Integer idSanPham, Integer idMauSac, Integer idKichThuoc, Integer idNot
    );
    @Query("""
    SELECT spct FROM SanPhamChiTiet spct
    WHERE spct.sanPham.id = :sanPhamId
    AND (:mauSacId IS NULL OR spct.mauSac.id = :mauSacId)
    AND (:kichThuocId IS NULL OR spct.kichThuoc.id = :kichThuocId)
    AND (:trangThai IS NULL OR spct.trangThai = :trangThai)
""")
    List<SanPhamChiTiet> filterSPCT(
            @Param("sanPhamId") Integer sanPhamId,
            @Param("mauSacId") Integer mauSacId,
            @Param("kichThuocId") Integer kichThuocId,
            @Param("trangThai") Integer trangThai
    );


    List<SanPhamChiTiet> findByKhuyenMai_Id(Integer khuyenMaiId);







}
