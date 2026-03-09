package com.example.backend.repository;

import com.example.backend.entity.DiaChi;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiaChiRepository extends JpaRepository<DiaChi,Integer> {

    List<DiaChi> findByKhachHang_Id(Integer idKhachHang);

}
