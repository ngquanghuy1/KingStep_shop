package com.example.backend.repository;

import com.example.backend.entity.ThuongHieu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ThuongHieuInterface extends JpaRepository<ThuongHieu, Integer> {
    List<ThuongHieu> findAllByTrangThai(int trangThai);
    Optional<ThuongHieu> findByTenThuongHieuIgnoreCase(String tenThuongHieu);
}
