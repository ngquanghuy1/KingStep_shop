package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.DangNhapRequest;
import com.example.backend.entity.KhachHang;
import com.example.backend.entity.NhanVien;
import com.example.backend.repository.KhachHangRepository;
import com.example.backend.repository.NhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private KhachHangRepository khachHangRepo;
    @Autowired
    private NhanVienRepository nhanVienRepo;

    public AuthResponse dangNhap(DangNhapRequest req) {
        String email = req.getEmail();
        String password = req.getMatKhau();

        // Check Khách hàng trước
        Optional<KhachHang> khOpt = khachHangRepo.findByEmail(email);
        if (khOpt.isPresent()) {
            KhachHang kh = khOpt.get();

            if (!password.equals(kh.getMatKhau())) {
                throw new RuntimeException("Sai mật khẩu khách hàng");
            }

            if (!Boolean.TRUE.equals(kh.getTrangThai())) {
                throw new RuntimeException("Tài khoản khách hàng bị khóa");
            }

            return new AuthResponse(kh.getId(), kh.getTenKhachHang(), "KHACH", "/trang-chu");
        }

        // Nếu không phải khách thì check nhân viên
        Optional<NhanVien> nvOpt = nhanVienRepo.findByEmail(email);
        if (nvOpt.isPresent()) {
            NhanVien nv = nvOpt.get();

            if (!password.equals(nv.getMatKhau())) {
                throw new RuntimeException("Sai mật khẩu nhân viên");
            }

            if (!Boolean.TRUE.equals(nv.getTrangThai())) {
                throw new RuntimeException("Tài khoản nhân viên bị khóa");
            }

            return new AuthResponse(nv.getId(), nv.getTenNhanVien(), "NHANVIEN", "/admin/ban-hang");
        }
        throw new RuntimeException("Email không tồn tại trong hệ thống");
    }

    public KhachHang dangKy(com.example.backend.dto.DangKyRequest req) {
        // Kiểm tra email
        Optional<KhachHang> khOpt = khachHangRepo.findByEmail(req.getEmail());
        if (khOpt.isPresent()) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        
        // Kiểm tra sdt
        Optional<KhachHang> phoneOpt = khachHangRepo.findBySoDienThoai(req.getSoDienThoai());
        if (phoneOpt.isPresent()) {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        KhachHang kh = new KhachHang();
        kh.setTenKhachHang(req.getTenKhachHang());
        kh.setEmail(req.getEmail());
        kh.setNgaySinh(req.getNgaySinh());
        kh.setGioiTinh(req.getGioiTinh());
        kh.setDiaChi(req.getDiaChi());
        kh.setSoDienThoai(req.getSoDienThoai());
        kh.setMatKhau(req.getMatKhau());
        kh.setTrangThai(true); // Mặc định hoạt động
        
        return khachHangRepo.save(kh);
    }
}
