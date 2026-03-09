package com.example.backend.repository;

import com.example.backend.entity.MauSac;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MauSacInterface extends JpaRepository<MauSac, Integer> {
    List<MauSac> findAllByTrangThai(int trangThai);
    Optional<MauSac> findByTenMauSacIgnoreCase(String tenMauSac);
}
