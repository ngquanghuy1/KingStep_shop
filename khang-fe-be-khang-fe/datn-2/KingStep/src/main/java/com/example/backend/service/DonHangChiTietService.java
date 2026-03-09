package com.example.backend.service;



import com.example.backend.entity.DonHang;
import com.example.backend.entity.DonHangChiTiet;
import com.example.backend.dto.DonHangChiTietDTO;
import com.example.backend.entity.SanPhamChiTiet;
import com.example.backend.repository.DonHangChiTietRepository;
import com.example.backend.repository.DonHangRepository;
import com.example.backend.repository.SanPhamChiTietRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DonHangChiTietService {


    @Autowired
    private DonHangChiTietRepository chiTietRepository;

    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private DonHangService donHangService;

    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;





    public List<DonHangChiTietDTO> getAll() {
        return chiTietRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DonHangChiTietDTO getById(int id) {
        return chiTietRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

//    public DonHangChiTietDTO create(DonHangChiTietDTO dto) {
//        DonHangChiTiet chiTiet = convertToEntity(dto);
//        return convertToDTO(chiTietRepository.save(chiTiet));
//    }
public List<DonHangChiTietDTO> getDonHangById(Integer id) {
    return chiTietRepository.findByDonHangId(id);
}
    public DonHangChiTietDTO create(DonHangChiTietDTO dto) {
        // 1. Lấy sản phẩm chi tiết từ DB
        SanPhamChiTiet spct = sanPhamChiTietRepository.findById(dto.getIdSanPhamChiTiet())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm chi tiết!"));

        // 2. Kiểm tra tồn kho
        if (spct.getSoLuong() < dto.getSoLuong()) {
            throw new RuntimeException("Số lượng tồn kho không đủ!");
        }

        // 3. Trừ tồn kho
        spct.setSoLuong(spct.getSoLuong() - dto.getSoLuong());
        sanPhamChiTietRepository.save(spct);

        // 4. Xử lý cộng dồn hoặc tạo mới chi tiết hóa đơn
        Optional<DonHangChiTiet> optional = chiTietRepository
                .findByDonHang_IdAndSanPhamChiTiet_Id(dto.getIdDonHang(), dto.getIdSanPhamChiTiet());

        DonHangChiTiet chiTiet;
        if (optional.isPresent()) {
            chiTiet = optional.get();
            chiTiet.setSoLuong(chiTiet.getSoLuong() + dto.getSoLuong());
            chiTiet.setThanhTien(chiTiet.getThanhTien() + dto.getThanhTien());
        } else {
            chiTiet = convertToEntity(dto);
        }

        // 5. Lưu và cập nhật tổng tiền đơn hàng
        DonHangChiTiet saved = chiTietRepository.save(chiTiet);
        donHangService.capNhatTongTienDonHang(dto.getIdDonHang());

        return convertToDTO(saved);
    }



    public DonHangChiTietDTO update(int id, DonHangChiTietDTO dto) {
        Optional<DonHangChiTiet> optional = chiTietRepository.findById(id);
        if (optional.isPresent()) {
            DonHangChiTiet chiTiet = optional.get();
            int oldQty = chiTiet.getSoLuong();
            int newQty = dto.getSoLuong();
            int diff = newQty - oldQty;

            SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
            if (diff > 0) {
                if (spct.getSoLuong() < diff)
                    throw new RuntimeException("Không đủ tồn kho!");
                spct.setSoLuong(spct.getSoLuong() - diff);
            } else if (diff < 0) {
                spct.setSoLuong(spct.getSoLuong() + (-diff));
            }
            sanPhamChiTietRepository.save(spct);

            chiTiet.setSoLuong(newQty);
            chiTiet.setThanhTien(dto.getThanhTien());

            DonHangChiTiet saved = chiTietRepository.save(chiTiet);
            donHangService.capNhatTongTienDonHang(chiTiet.getDonHang().getId());

            return convertToDTO(saved);
        }
        return null;
    }


    public void delete(int id) {
        Optional<DonHangChiTiet> optional = chiTietRepository.findById(id);
        if (optional.isPresent()) {
            DonHangChiTiet chiTiet = optional.get();
            SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();
            // Hoàn lại tồn kho
            spct.setSoLuong(spct.getSoLuong() + chiTiet.getSoLuong());
            sanPhamChiTietRepository.save(spct);

            DonHang donHang = chiTiet.getDonHang();
            if (donHang != null && donHang.getDonHangChiTiets() != null) {
                donHang.getDonHangChiTiets().remove(chiTiet); // Quan trọng!
            }

            chiTietRepository.deleteById(id);
            donHangService.capNhatTongTienDonHang(donHang.getId());
        }
    }
    private DonHangChiTietDTO convertToDTO(DonHangChiTiet ct) {
        DonHangChiTietDTO dto = new DonHangChiTietDTO();
        dto.setId(ct.getId());
        dto.setIdDonHang(ct.getDonHang() != null ? ct.getDonHang().getId() : null);
        dto.setIdSanPhamChiTiet(ct.getSanPhamChiTiet() != null ? ct.getSanPhamChiTiet().getId() : null);
        dto.setSoLuong(ct.getSoLuong());
        dto.setGia(ct.getGia());
        dto.setThanhTien(ct.getThanhTien());
        return dto;
    }

    private DonHangChiTiet convertToEntity(DonHangChiTietDTO dto) {
        DonHangChiTiet ct = new DonHangChiTiet();
        ct.setSoLuong(dto.getSoLuong());
        ct.setGia(dto.getGia());
        ct.setThanhTien(dto.getThanhTien());

        if (dto.getIdDonHang() != null) {
            donHangRepository.findById(dto.getIdDonHang()).ifPresent(ct::setDonHang);
        }

        if (dto.getIdSanPhamChiTiet() != null) {
            sanPhamChiTietRepository.findById(dto.getIdSanPhamChiTiet()).ifPresent(ct::setSanPhamChiTiet);
        }

        return ct;
    }
}
