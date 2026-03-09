package com.example.backend.repository;

import com.example.backend.entity.DanhMuc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DanhMucInterface extends JpaRepository<DanhMuc,Integer> {
    List<DanhMuc> findAllByTrangThai(int trangThai);
    Optional<DanhMuc> findByTenDanhMucIgnoreCase(String tenDanhMuc);
}
