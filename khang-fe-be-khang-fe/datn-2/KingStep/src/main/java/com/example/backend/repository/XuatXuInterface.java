package com.example.backend.repository;

import com.example.backend.entity.XuatXu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface XuatXuInterface extends JpaRepository<XuatXu, Integer> {
    List<XuatXu> findAllByTrangThai(int trangThai);
    Optional<XuatXu> findByTenXuatXuIgnoreCase(String tenXuatXu);

}
