
package com.example.backend.service;


import com.example.backend.dto.VoucherDTO;
import com.example.backend.entity.DonHang;
import com.example.backend.entity.Voucher;
import com.example.backend.repository.DonHangRepository;
import com.example.backend.repository.VoucherRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private DonHangRepository donHangRepository;

    public VoucherDTO convertDTO(Voucher voucher, Boolean isAvailable){
        VoucherDTO dto = new VoucherDTO(
                voucher.getId(),
                voucher.getMaVoucher(),
                voucher.getTenVoucher(),
                voucher.getLoaiVoucher(),
                voucher.getMoTa(),
                voucher.getSoLuong(),
                voucher.getGiaTri(),
                voucher.getDonToiThieu(),
                voucher.getNgayBatDau(),
                voucher.getNgayKetThuc(),
                null, // Không set trangThai từ database
                isAvailable
        );
        // Trạng thái sẽ được tính động bởi getTrangThai()
        return dto;
    }
    //Hàm 1 tham số dụng cho các hàm crud
    public VoucherDTO convertDTO(Voucher voucher) {
        return convertDTO(voucher, null); // hoặc true nếu muốn mặc định là đủ điều kiện
    }

    // ham lay all voucher
    public List<VoucherDTO> getall(){
        return voucherRepository.findAll().stream()
                .map(voucher -> new VoucherDTO(
                        voucher.getId(),
                        voucher.getMaVoucher(),
                        voucher.getTenVoucher(),
                        voucher.getLoaiVoucher(),
                        voucher.getMoTa(),
                        voucher.getSoLuong(),
                        voucher.getGiaTri(),
                        voucher.getDonToiThieu(),
                        voucher.getNgayBatDau(),
                        voucher.getNgayKetThuc(),
                        voucher.getTrangThai(),
                        null // hoặc true nếu muốn mặc định là đủ điều kiện
                )).toList();
    }


    //ham lay danh sach theo id
    public VoucherDTO findById(Integer id){
        return voucherRepository.findById(id)
                .map(voucher -> new VoucherDTO(
                        voucher.getId(),
                        voucher.getMaVoucher(),
                        voucher.getTenVoucher(),
                        voucher.getLoaiVoucher(),
                        voucher.getMoTa(),
                        voucher.getSoLuong(),
                        voucher.getGiaTri(),
                        voucher.getDonToiThieu(),
                        voucher.getNgayBatDau(),
                        voucher.getNgayKetThuc(),
                        voucher.getTrangThai(),
                        null // hoặc true
                ))
                .orElse(null);
    }

    // ham create voucher
    public VoucherDTO create(VoucherDTO dto){
        Voucher v = new Voucher();
        v.setMaVoucher(dto.getMaVoucher());
        v.setTenVoucher(dto.getTenVoucher());
        v.setLoaiVoucher(dto.getLoaiVoucher());
        v.setSoLuong(dto.getSoLuong());
        v.setMoTa(dto.getMoTa());
        v.setGiaTri(dto.getGiaTri());
        v.setDonToiThieu(dto.getDonToiThieu());
        v.setNgayBatDau(dto.getNgayBatDau());
        v.setNgayKetThuc(dto.getNgayKetThuc());

        // KHÔNG set trangThai nữa, để tính động
        // v.setTrangThai(0); // Có thể set mặc định là 0

        return convertDTO(voucherRepository.save(v));
    }

    // ham delete voucher
    public boolean delete(Integer id){
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));
        // Kiểm tra có đơn hàng nào đang dùng voucher này không
        List<DonHang> donHangs = donHangRepository.findAllByGiamGia_Id(id);
        if (!donHangs.isEmpty()) {
            throw new RuntimeException("Không thể xóa voucher vì đang được áp dụng cho đơn hàng!");
        }
        voucherRepository.deleteById(id);
        return true;
    }

    //ham update voucher
    public VoucherDTO update (int id, VoucherDTO dto){
        return voucherRepository.findById(id)
                .map( v  -> {
                    v.setMaVoucher(dto.getMaVoucher());
                    v.setTenVoucher(dto.getTenVoucher());
                    v.setLoaiVoucher(dto.getLoaiVoucher());
                    v.setSoLuong(dto.getSoLuong());
                    v.setMoTa(dto.getMoTa());
                    v.setGiaTri(dto.getGiaTri());
                    v.setDonToiThieu(dto.getDonToiThieu());
                    v.setNgayBatDau(dto.getNgayBatDau());
                    v.setNgayKetThuc(dto.getNgayKetThuc());
                    v.setTrangThai(dto.getTrangThai());

                    return convertDTO(voucherRepository.save(v));
                })
                .orElse(null);
    }

    @Scheduled(fixedRate = 600000) // Cập nhật mỗi 60 giây
    public void updateActiveVoucher() {
        updateVoucherActive();
    }

    /**
     * Cập nhật trạng thái voucher:
     * - Nếu đã hết hạn: trạng thái = 0
     * - Nếu đang hoạt động: trạng thái = 1
     * - Nếu chưa bắt đầu hoặc hết hạn: trạng thái = 0
     */
    @Transactional
    public void updateVoucherActive() {
        LocalDateTime now = LocalDateTime.now();

        List<Voucher> voucherList = voucherRepository.findAll();
        List<Voucher> vouchersToUpdate = new ArrayList<>();
        List<DonHang> donHangsToUpdate = new ArrayList<>();

        for (Voucher v : voucherList) {
            boolean isExpired = v.getNgayKetThuc().isBefore(now);
            boolean isNotStarted = v.getNgayBatDau().isAfter(now);
            boolean isOutOfStock = v.getSoLuong() != null && v.getSoLuong() == 0;

            boolean isInvalid = isExpired || isNotStarted || isOutOfStock;
            boolean isActive = !isInvalid;

            List<DonHang> donHangsWithVoucher = donHangRepository.findAllByGiamGia_Id(v.getId());

            if (isInvalid) {
                for (DonHang dh : donHangsWithVoucher) {
                    dh.setGiamGia(null);
                    dh.setTongTienGiamGia(dh.getTongTien());
                    donHangsToUpdate.add(dh);
                }

                if (v.getTrangThai() == null || v.getTrangThai() != 0) {
                    v.setTrangThai(0);
                    vouchersToUpdate.add(v);
                }

            } else if (isActive) {
                if (v.getTrangThai() == null || v.getTrangThai() != 1) {
                    v.setTrangThai(1);
                    vouchersToUpdate.add(v);
                }
            }
        }

        if (!donHangsToUpdate.isEmpty()) {
            donHangRepository.saveAll(donHangsToUpdate);
        }

        if (!vouchersToUpdate.isEmpty()) {
            voucherRepository.saveAll(vouchersToUpdate);
        }
    }



    public void updateVoucherForDonHang(DonHang dh, Integer idVoucher) {

        Voucher voucher = voucherRepository.findById(idVoucher)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        double tongTien = dh.getTongTien();

        // Kiểm tra điều kiện áp dụng voucher
        if (voucher.getTrangThai() == null || voucher.getTrangThai() != 1) {
            dh.setGiamGia(null);
            throw new RuntimeException("Voucher không hoạt động");
        }

        if (voucher.getSoLuong() == null || voucher.getSoLuong() <= 0) {
            dh.setGiamGia(null);
            throw new RuntimeException("Voucher đã hết lượt sử dụng");
        }

        if (voucher.getNgayBatDau().isAfter(LocalDateTime.now()) || voucher.getNgayKetThuc().isBefore(LocalDateTime.now())) {
            dh.setGiamGia(null);
            throw new RuntimeException("Voucher không còn hiệu lực theo thời gian");
        }

        if (voucher.getDonToiThieu() != null && tongTien < voucher.getDonToiThieu()) {
            dh.setGiamGia(null);
            throw new RuntimeException("Đơn hàng không đủ điều kiện áp dụng voucher");
        }

        // Gán voucher và tính lại tổng tiền giảm giá
        dh.setGiamGia(voucher);
        dh.setTongTienGiamGia(tinhTongTienSauGiam(dh.getTongTien(), voucher));

        // Trừ số lượng nếu đơn hàng đã hoàn tất
        if ("".equals(dh.getTrangThai())) {
            voucher.setSoLuong(voucher.getSoLuong() - 1);
            voucherRepository.save(voucher);
        }
    }
    public void kiemTraDieuKienVoucher(DonHang dh, Integer idVoucher) {
        Voucher voucher = voucherRepository.findById(idVoucher)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        double tongTien = dh.getTongTien();

        if (voucher.getTrangThai() == null || voucher.getTrangThai() != 1) {
            throw new RuntimeException("Voucher không hoạt động");
        }
        if (voucher.getSoLuong() == null || voucher.getSoLuong() < 0) {
            throw new RuntimeException("Voucher đã hết lượt sử dụng");
        }
        if (voucher.getNgayBatDau().isAfter(LocalDateTime.now()) || voucher.getNgayKetThuc().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Voucher không còn hiệu lực theo thời gian");
        }
        if (voucher.getDonToiThieu() != null && tongTien < voucher.getDonToiThieu()) {
            throw new RuntimeException("Đơn hàng không đủ điều kiện áp dụng voucher");
        }
    }

    private double tinhTongTienSauGiam(double tongTien, Voucher voucher) {
        double giam = 0.0;

        if ("PHAN_TRAM".equalsIgnoreCase(voucher.getLoaiVoucher())) {
            giam = tongTien * (voucher.getGiaTri() / 100);
        } else if ("TIEN_MAT".equalsIgnoreCase(voucher.getLoaiVoucher())) {
            giam = voucher.getGiaTri();
        }

        double result = tongTien - giam;
        return result < 0 ? 0 : result;
    }
    //Kiểm tra xem voucher nào đủ điều kiện áp dụng cho đơn hàng
    public List<VoucherDTO> getAvailableVouchers(Integer orderId) {
        DonHang donHang = donHangRepository.findById(orderId).orElse(null);
        List<Voucher> allVouchers = voucherRepository.findAll();
        List<VoucherDTO> result = new ArrayList<>();
        for (Voucher v : allVouchers) {
            boolean isAvailable = true;
            try {
                if (donHang != null) {
                    kiemTraDieuKienVoucher(donHang, v.getId());
                }
            } catch (Exception e) {
                isAvailable = false;
            }
            VoucherDTO dto = convertDTO(v);
            dto.setIsAvailable(isAvailable);
            result.add(dto);
        }
        // Sắp xếp voucher đủ điều kiện lên đầu (nếu muốn)
        result.sort((a, b) -> Boolean.compare(Boolean.TRUE.equals(b.getIsAvailable()), Boolean.TRUE.equals(a.getIsAvailable())));
        return result;
    }

}
