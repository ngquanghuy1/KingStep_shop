package com.example.backend.repository;

import com.example.backend.entity.KichThuoc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KichThuocInterface extends JpaRepository<KichThuoc,Integer> {
    List<KichThuoc> findAllByTrangThai(int trangThai);
    Optional<KichThuoc> findByTenKichThuocIgnoreCase(String tenKichThuoc);
}
