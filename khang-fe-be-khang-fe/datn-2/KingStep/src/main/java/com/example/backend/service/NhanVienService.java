package com.example.backend.service;

import com.example.backend.dto.NhanVienDTO;


import com.example.backend.entity.NhanVien;
import com.example.backend.repository.NhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NhanVienService {

    @Autowired
    private NhanVienRepository nhanVienRepository;
    // ham convert entity sang dto
    public NhanVienDTO convertDTO (NhanVien nv){

        return new NhanVienDTO(
          nv.getId(),
          nv.getTenNhanVien(),
          nv.getEmail(),
          nv.getSoDienThoai(),
          nv.getNgaySinh(),
          nv.getGioiTinh(),
          nv.getDiaChi(),
                nv.getVaiTro(),
                nv.getCccd(),
                nv.getTrangThai()
        );

    }
    // ham lay all nhan vien
    public List<NhanVienDTO> findall(){
        return nhanVienRepository.findAll().stream()
                .map(nhanVien -> new NhanVienDTO(
                        nhanVien.getId(),
                        nhanVien.getTenNhanVien(),
                        nhanVien.getEmail(),
                        nhanVien.getSoDienThoai(),
                        nhanVien.getNgaySinh(),
                        nhanVien.getGioiTinh(),
                        nhanVien.getDiaChi(),
                        nhanVien.getVaiTro(),
                        nhanVien.getCccd(),
                        nhanVien.getTrangThai()
                ))
                .toList();
    }
    //ham lay danh sach theo id
    public NhanVienDTO findById(Integer id){
        return nhanVienRepository.findById(id)
                .map(nhanVien -> new NhanVienDTO(
                        nhanVien.getId(),
                        nhanVien.getTenNhanVien(),
                        nhanVien.getEmail(),
                        nhanVien.getSoDienThoai(),
                        nhanVien.getNgaySinh(),
                        nhanVien.getGioiTinh(),
                        nhanVien.getDiaChi(),
                        nhanVien.getVaiTro(),
                        nhanVien.getCccd(),
                        nhanVien.getTrangThai()
                ))
                .orElse(null);
    }
    // ham create nhanvien
    public NhanVienDTO create(NhanVienDTO dto){
        NhanVien nv = new NhanVien();
        nv.setTenNhanVien(dto.getTenNhanVien());
        nv.setEmail(dto.getEmail());
        nv.setSoDienThoai(dto.getSoDienThoai());
        nv.setNgaySinh(dto.getNgaySinh());
        nv.setGioiTinh(dto.getGioiTinh());
        nv.setDiaChi(dto.getDiaChi());
        nv.setVaiTro(dto.getVaiTro());
        nv.setCccd(dto.getCccd());
        nv.setTrangThai(dto.getTrangThai());
        return convertDTO(nhanVienRepository.save(nv));
    }

    // ham delete nhan vien

    public boolean delete(Integer id){
        if (nhanVienRepository.existsById(id)) {
            nhanVienRepository.deleteById(id);
            return true;
        }
        return false;
    }

    //ham update nhan vien
    public NhanVienDTO update (int id, NhanVienDTO dto){
        return nhanVienRepository.findById(id)
                .map( nhanVien -> {
                    nhanVien.setTenNhanVien(dto.getTenNhanVien());
                    nhanVien.setEmail(dto.getEmail());
                    nhanVien.setSoDienThoai(dto.getSoDienThoai());
                    nhanVien.setNgaySinh(dto.getNgaySinh());
                    nhanVien.setGioiTinh(dto.getGioiTinh());
                    nhanVien.setDiaChi(dto.getDiaChi());
                    nhanVien.setVaiTro(dto.getVaiTro());
                    nhanVien.setCccd(dto.getCccd());
                    nhanVien.setTrangThai(dto.getTrangThai());
                    return convertDTO(nhanVienRepository.save(nhanVien));
                })
                .orElse(null);
    }
}
